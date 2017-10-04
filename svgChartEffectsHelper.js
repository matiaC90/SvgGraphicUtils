SvgChartEffectsHelper = {};
var numberEntryNotification = 0;
var numberTransitEnterArea = 0;
SvgChartEffectsHelper.isZooming = false;

SvgChartEffectsHelper.launchPersonAnimation = function (selectionTransitToShow, isZooming, idArc, operationInfo, widthNotification, heightNotification) {
	var arc = Snap.select("#arc_" + idArc);
	var colorUsed = null;
	var coordinates = null;

	if (operationInfo.valid) {
		colorUsed = "#2ecc71";
	}
	else {
		colorUsed = "#e74c3c";
	}

	if (arc != null && arc != undefined) {
		coordinates =  SvgChartEdgeHelper.globalMapEdgeStorage["arc_" + idArc];
		var center = SvgChartHelper.calculateCoordinateAndOffsetOfCenterInAnElement("snap_", operationInfo.areaIn);
		var pointsEnd = SvgChartHelper.getCoordinatesForEnterAreaInLabelOfShape(center.x, center.y, center.offsetX);
		var showedAll = selectionTransitToShow == "all";
		var showedSuccessFull = operationInfo.valid && selectionTransitToShow != "unsuccess";
		var showedUnsuccessFull = !operationInfo.valid && selectionTransitToShow != "success";
		var showed = showedAll || showedSuccessFull || showedUnsuccessFull;

		SvgChartEffectsHelper.prepareToLaunchArcAnimation(showed, showedSuccessFull, showedUnsuccessFull, coordinates, colorUsed, idArc, operationInfo, pointsEnd);

	}

};

SvgChartEffectsHelper.prepareToLaunchArcAnimation = function (showed, showedSuccessFull, showedUnsuccessFull, coordinates, colorUsed, idArc, operationInfo, pointsEnd) {
	var idEnterArea = null;
	var pointsEndNotValid = null;
	if (showed) {
		numberTransitEnterArea++;
		idEnterArea = "transit_enter_area" + numberTransitEnterArea;
		globalSnapGraph.ellipse(coordinates.areaOut.x, coordinates.areaOut.y, 10, 10).attr({
			id: idEnterArea,
			fill: colorUsed,
			stroke: "#555",
			strokeWidth: 1
		});

		if (SvgChartEffectsHelper.isZooming) {
			var group = Snap.select('#snapsvg-zpd-' + globalSnapGraph.id);
			group.add(globalSnapGraph.select("#" + idEnterArea));
		}

		if (showedUnsuccessFull) {
			var xHalf = (coordinates.areaIn.x + coordinates.areaOut.x) / 2;
			var yHalf = (coordinates.areaIn.y + coordinates.areaOut.y) / 2;
			pointsEndNotValid = {left: xHalf, top: yHalf};

		}

		if (showedSuccessFull) {
			globalSnapGraph.select("#" + idEnterArea).animate({
				cx: coordinates.areaOut.x,
				cy: coordinates.areaOut.y
			}, 500, mina.linear, function () {
				SvgChartEffectsHelper.jumpDestinationAreaIn(idEnterArea, coordinates, pointsEnd, colorUsed, operationInfo, idArc);
			});

		}
		else {
			globalSnapGraph.select("#" + idEnterArea).animate({
				cx: coordinates.areaOut.x,
				cy: coordinates.areaOut.y
			}, 500, mina.linear, function () {
				SvgChartEffectsHelper.jumpDestinationAreaIn(idEnterArea, coordinates, pointsEndNotValid, colorUsed, operationInfo, idArc);
			});
		}

	}
};

SvgChartEffectsHelper.jumpDestinationAreaIn = function (idEnterArea, coordinates, pointsEnd, colorUsed, operationInfo, idArc) {
	globalSnapGraph.select("#" + idEnterArea).animate({
		cx: coordinates.areaOut.x,
		cy: coordinates.areaOut.y
	}, 1000, mina.linear);
	var areaInX = null;
	var areaInY = null;
	if (operationInfo.valid) {
		areaInX = coordinates.areaIn.x;
		areaInY = coordinates.areaIn.y;
	}
	else {
		areaInX = pointsEnd.left;
		areaInY = pointsEnd.top;
	}

	globalSnapGraph.select("#" + idEnterArea).animate({
		cx: areaInX,
		cy: areaInY
	}, 1000, mina.linear, function () {
		if (!operationInfo.valid) {
			var i = 0;

			$("#" + idEnterArea).attr("class", "flashEnterArea");
			var arc = Snap.select("#arc_" + idArc);
			if (arc != null) {
				var attributeMarkerEnd = arc.node.style.markerEnd;
				var markerEnd = attributeMarkerEnd.substring(attributeMarkerEnd.indexOf("#") + 1, attributeMarkerEnd.indexOf(")") - 1);
				var markerArc = Snap.select("#" + markerEnd).children()[0];

				markerArc.attr({
					fill: colorUsed,
					stroke: colorUsed
				});
				arc.attr({
					stroke: colorUsed,
					strokeWidth: 5
				});
				arc.animate({
					stroke: '#BBBBBB',
					strokeWidth: 2
				}, 3000, mina.linear);
				markerArc.animate({
					fill: "#BBBBBB",
					stroke: "#BBBBBB"
				}, 3000, mina.linear);

				$("#" + idEnterArea).bind("webkitAnimationEnd oanimationend msAnimationEnd animationend", function () {

					$("#" + idEnterArea).attr("class", "flashEnterAreaHide");
					$("#" + idEnterArea).bind("webkitAnimationEnd oanimationend msAnimationEnd animationend", function () {
						$(this).remove();
					});

				});

				pointsEnd = SvgChartHelper.calculateCoordinateTopAndLeftInAnElement("arc_", idArc, 90, 40);
				pointsEnd.top = pointsEnd.top - 10;

			}

		}
		else {
			SvgChartEffectsHelper.makeNotVisibleEnterEllipseAreaIn(idEnterArea);
		}

		SvgChartEffectsHelper.createDivNotificationToShow(pointsEnd, colorUsed, operationInfo);
	});


};

SvgChartEffectsHelper.createDivNotificationToShow = function (pointsEnd, colorUsed, operationInfo) {

	if (pointsEnd != null) {
		numberEntryNotification++;
		$(document.body).append('<div id="notification_' + numberEntryNotification + '" ' +
			'class="entranceMonitoringNotification" style="position: absolute; top: ' + pointsEnd.top + 'px; left:' + pointsEnd.left + 'px; background-color:' + colorUsed + '; border: 2px ' + colorUsed + ' solid;">' +
			'<div style="display: table-cell;">' +

			'<span style="padding-left: 2px; font-weight:bold; display: inline; padding-right:2px;">' + operationInfo.cardNumber + ' : ' + operationInfo.userLabel + '</span>' +
			'</div> </div>');

		$("#notification_" + numberEntryNotification).addClass("transitionEntranceMonitoringDiv");
		$("#notification_" + numberEntryNotification).bind("webkitAnimationEnd oanimationend msAnimationEnd animationend", function () {
			$(this).remove();
		});

	}
}

SvgChartEffectsHelper.makeNotVisibleEnterEllipseAreaIn = function (idEnterArea) {
	globalSnapGraph.select("#" + idEnterArea).attr({
		opacity: 0
	});
	globalSnapGraph.select("#" + idEnterArea).remove();

};
