(function($, window, document, undefined) {
	
	$.fn.treeMap = function(options) {
		return new initTreeMap(this, options);
	}
	
	$.fn.treeMap.defaults = {
		data : {}, // 渲染树状图的数据【必须】
		direction : "horizontal", // 渲染树状图的轴方向（vertical: 垂直 ; horizontal: 水平）
		mapClass : "treeMap",
		depth : -1,
		initLi : function (item) {
			return $("<li></li>").append("<span>" + item.content + "</span>");
		}
	};
	
	function initTreeMap(element, options) {
		this.element = $(element);
		this.options = $.extend({}, $.fn.treeMap.defaults, options);
		this.init();
	}
	
	initTreeMap.prototype = {
		init: function() {
			var _element = this.element;
			var _options = this.options;
			var $rootElement = $(_element); // 获取根容器元素
			var $container = $("<div class='" + _options.mapClass + " " + _options.direction + "'/>"); // 创建容器
			
			this.createList($rootElement, _options);
			if (this.options.direction == "horizontal") {
				this.renderForHorizontal($("#treeList").find("li:first"), $container, 0, this.options);
			} else {
				this.renderForVertical($("#treeList").find("li:first"), $container, 0, this.options);
			}
			$rootElement.append($container);
		},
		createList: function(element, options) { // 根据数据创建 ul-li 列表
			var $treeList = $("<ul id='treeList' style='display:none'></ul>");
			initList($treeList, options.data);
			$(element).append($treeList);
			
			function initList(treeList, jsonData) {
				$.each(jsonData, function(index, item) {
					if (item != null) {
						var li = options.initLi(item);
						if (item.childrens.length > 0) {
							li.append("<ul></ul>").appendTo(treeList);
							initList($(li).children().eq(1), item.childrens); // 递归创建子节点
						} else {
							li.appendTo(treeList);
						}
					}
				});
			}
		},
		renderForHorizontal: function(node, container, level, options) { // 递归创建节点（水平方向）
			var $this = this;
			var $childNodes = node.children("ul:first").children("li");
			var _rowspan = ($childNodes.length > 0) ? ($childNodes.length*4) : (2);
			
			var $table = $("<table cellpadding='0' cellspacing='0' border='0'/>");
			var $tbody = $("<tbody/>");
			
			var $nodeCol = $("<tr/>").addClass("node-cells");
			var $nodeCell = $("<td/>").addClass("node-cell").attr("rowspan", _rowspan);
			var $nodeContent = node.clone().children("ul,li").remove().end().html();
			var $nodeDiv = $("<div>").addClass("node")
								.attr("style", (node.attr("style")) ? (node.attr("style")) : (""))
								.attr("title", (node.attr("title")) ? (node.attr("title")) : (""))
								.append($nodeContent);
			
			if ($childNodes.length > 0) {
				$nodeDiv.click(function() { // 展开、收起子节点
					var $tr = $(this).closest("tr");
					$(this).css('cursor','w-resize');
					if($tr.hasClass('contracted')){
						$tr.removeClass('contracted').addClass('expanded');
						$tr.nextAll("tr").css('visibility', '');
						node.removeClass('collapsed');
					}else{
						$tr.removeClass('expanded').addClass('contracted');
						$tr.nextAll("tr").css('visibility', 'hidden');
						node.addClass('collapsed');
					}
				});
			}
			
			$tbody.append($nodeCol.append($nodeCell.append($nodeDiv)));
			
			if ($childNodes.length > 0) {
				$nodeDiv.css('cursor','w-resize');
				if (options.depth == -1 || (level+1 < options.depth)) { 
					var $rightLineCol = $("<tr/>");
					var $rightLineCell = $("<td/>").attr("rowspan", $childNodes.length*4);
					var $rightLine = $("<div></div>").addClass("line right");
					$tbody.append($rightLineCol.append($rightLineCell.append($rightLine)));
					
					var _linesCols = [];
					$childNodes.each(function() {
						var $childNode = $("<td class='node-container'/>").attr("rowspan", 2);
						$this.renderForHorizontal($(this), $childNode, level+1, options);
						
						var $down = $("<td>&nbsp;</td>").addClass("line down left");
						var $top = $("<td>&nbsp;</td>").addClass("line top left");
						
						_linesCols.push($("<tr/>").append($down).append($childNode));
						_linesCols.push($("<tr/>").append($top));
					});
					for (var i=0 ; i<_linesCols.length ; i++) {
						if (i == 0 || i == _linesCols.length-1) {
							_linesCols[i].find("td:first").removeClass("left");
						}
						$tbody.append(_linesCols[i]);
					}
				}
			}
			
			if (node.attr('class') != undefined) {
				var classList = node.attr('class').split(/\s+/);
				$.each(classList, function(index, item) {
					if (item == 'collapsed') {
						$nodeRow.nextAll('tr').css('visibility', 'hidden');
						$nodeRow.removeClass('expanded');
						$nodeRow.addClass('contracted');
						$nodeDiv.css('cursor','s-resize');
					} else {
						$nodeDiv.addClass(item);
					}
				});
			}
			container.append($table.append($tbody));
			
			$nodeDiv.children('a').click(function(e){
				console.log(e);
				e.stopPropagation();
			});
		},
		renderForVertical: function(node, container, level, options) { // 递归创建节点（垂直方向）
			var $this = this;
			var $childNodes = node.children("ul:first").children("li");
			var _colspan = ($childNodes.length > 0) ? ($childNodes.length*2) : (2);
			
			var $table = $("<table cellpadding='0' cellspacing='0' border='0'/>");
			var $tbody = $("<tbody/>");
			
			var $nodeRow = $("<tr/>").addClass("node-cells");
			var $nodeCell = $("<td/>").addClass("node-cell").attr("colspan", _colspan);
			var $nodeContent = node.clone().children("ul,li").remove().end().html();
			var $nodeDiv = $("<div>").addClass("node")
								.attr("style", (node.attr("style")) ? (node.attr("style")) : (""))
								.attr("title", (node.attr("title")) ? (node.attr("title")) : (""))
								.append($nodeContent);
			
			if ($childNodes.length > 0) {
				$nodeDiv.click(function() { // 展开、收起子节点
					var $tr = $(this).closest("tr");
					$(this).css('cursor','s-resize');
					if($tr.hasClass('contracted')){
						$tr.removeClass('contracted').addClass('expanded');
						$tr.nextAll("tr").css('visibility', '');
						node.removeClass('collapsed');
					}else{
						$tr.removeClass('expanded').addClass('contracted');
						$tr.nextAll("tr").css('visibility', 'hidden');
						node.addClass('collapsed');
					}
				});
			}
			
			$tbody.append($nodeRow.append($nodeCell.append($nodeDiv)));
			
			if ($childNodes.length > 0) {
				$nodeDiv.css('cursor','s-resize');
				if (options.depth == -1 || (level+1 < options.depth)) { 
					var $downLineRow = $("<tr/>");
					var $downLineCell = $("<td/>").attr("colspan", $childNodes.length*2);
					var $downLine = $("<div></div>").addClass("line down");
					$tbody.append($downLineRow.append($downLineCell.append($downLine)));
					
					var $linesRow = $("<tr/>");
					$childNodes.each(function() {
						var $left = $("<td>&nbsp;</td>").addClass("line left top");
						var $right = $("<td>&nbsp;</td>").addClass("line right top");
						$linesRow.append($left).append($right);
					});
					$linesRow.find("td:first").removeClass("top").end().find("td:last").removeClass("top");
					$tbody.append($linesRow);
					
					var $childNodesRow = $("<tr/>");
					$childNodes.each(function() {
						var $td = $("<td class='node-container'/>");
						$td.attr("colspan", 2);
						$this.renderForVertical($(this), $td, level+1, options);
						$childNodesRow.append($td);
					});
					$tbody.append($childNodesRow);
				}
			}
			
			if (node.attr('class') != undefined) {
				var classList = node.attr('class').split(/\s+/);
				$.each(classList, function(index, item) {
					if (item == 'collapsed') {
						$nodeRow.nextAll('tr').css('visibility', 'hidden');
						$nodeRow.removeClass('expanded');
						$nodeRow.addClass('contracted');
						$nodeDiv.css('cursor','s-resize');
					} else {
						$nodeDiv.addClass(item);
					}
				});
			}
			container.append($table.append($tbody));
			
			$nodeDiv.children('a').click(function(e){
				console.log(e);
				e.stopPropagation();
			});
		}
	};
	
})(jQuery, window, document);
