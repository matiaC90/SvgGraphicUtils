var SvgChartHelper = {};
var areaLocationMappingUuidDrawComplete = [];
var svgGlobalContainer = {};
var globalAngleOffset = {};
var globalMapEdgesLocationAndReader = {};

SvgChartHelper.drawGraph = function (nodesAttributes, nodesParam, svgContainer) {
	svgGlobalContainer = null;
	if (svgContainer != null) {
		svgGlobalContainer = svgContainer;
	}

	areaLocationMappingUuidDrawComplete = [];
	for (var i = 0; i < nodesParam.length; i++) {

		for (var j = 0; j < nodesAttributes.length; j++) {
			if (nodesParam[i].uuid == nodesAttributes[j].id) {
				var coordinateX = nodesAttributes[j].position.x;
				var coordinateY = nodesAttributes[j].position.y;

				var newColor = SvgChartHelper.setColorOfGraphElement(nodesAttributes[j].color);

				if (nodesAttributes[j].shape == "rectangle") {
					var xFinal = (coordinateX - ((nodesAttributes[j].width * 1.2)/ 2));
					var yFinal = (coordinateY - ((nodesAttributes[j].height * 1.2) / 2));

					svgGlobalContainer.rect(xFinal, yFinal, nodesAttributes[j].width * 1.2, nodesAttributes[j].height * 1.2).attr({
						id: "snap_" + nodesParam[j].uuid,
						fill: newColor,
						stroke: "#555",
						strokeWidth: 1
					});

					svgGlobalContainer.text(xFinal + (nodesAttributes[j].width / 2), yFinal - 5, nodesParam[j].name).attr({
						'font-size': 25,
						'text-anchor': "middle"
					});

				}
				else {

					svgGlobalContainer.ellipse(coordinateX, coordinateY,
						nodesAttributes[j].width / 2, nodesAttributes[j].height / 2).attr({
						id: "snap_" + nodesParam[j].uuid,
						fill: newColor,
						stroke: "#555",
						strokeWidth: 1
					});
					svgGlobalContainer.text(coordinateX, coordinateY + 5, nodesParam[j].name).attr({
						id: nodesParam[j].name,
						'font-size': 25,
						'text-anchor': "middle"
					});

				}

			}
		}
	}
};

SvgChartHelper.setColorOfGraphElement = function (color) {
	if (color.indexOf("#") == -1) {
		var colorUsed = color.substr(color.indexOf('(') + 1, color.indexOf('%'));
		var arrayColors = colorUsed.replace("%", "").split(",");
		var h = arrayColors[0];
		var l = arrayColors[1].replace("%", "");
		var s = arrayColors[2];
		return Snap.hsl(h, l, s);
	}
	else {
		return color;
	}

};


SvgChartHelper.getCoordinatesSudOfShape = function (centerX, centerY, halfWidth, halfHeight, widthInfo) {
	var leftX = centerX - (widthInfo / 2);
	var topY = centerY + halfHeight;
	var y = null;
	var offsetY = 5;
	var y = topY + offsetY;

	var coordinates = {left: leftX, top: y};
	return coordinates;

};

SvgChartHelper.getCoordinatesForEnterAreaInLabelOfShape = function (centerX, centerY, halfWidth) {
	var leftX = centerX - halfWidth;
	var offsetY = 8;
	var y = centerY + offsetY;
	var coordinates = {left: leftX, top: y};
	return coordinates;

};


SvgChartHelper.calculateEdgeCoordinatesForTwoNodes = function (mapEdges, mapEdgesLocationAndReader,jAngleOffset) {
	if (jAngleOffset != null) {
		globalAngleOffset = jAngleOffset;
	}

	globalMapEdgesLocationAndReader = mapEdgesLocationAndReader;

	for (var edge in mapEdges) {
		var edgeObject = mapEdges[edge];
		var areaOut = edgeObject.areaOut;
		var areaIn = edgeObject.areaIn;
		var doubleOrientation = edgeObject.doubleOrientation;
		var cardinalityEdge = mapEdges[edge].cardinality;
		var locationUuidEdge = mapEdges[edge].locationUuid;
		var readerEdge = mapEdges[edge].reader;
		var cardinalityEdgeInverse = null;

		var alreadyDrawed = false;
		if (doubleOrientation) {
			var arcA = areaOut.id + "_" + areaIn.id;
			var arcInverse = areaIn.id + "_" + areaOut.id;
			cardinalityEdgeInverse = mapEdges[arcInverse].cardinality;
			var locationUuidIverseEdge = mapEdges[arcInverse].locationUuid;
			var readerInverseEdge = mapEdges[arcInverse].reader;

			if (areaLocationMappingUuidDrawComplete.indexOf(arcA) != -1 && areaLocationMappingUuidDrawComplete.indexOf(arcInverse) != -1) {
				alreadyDrawed = true;
			}

		}

		if (!alreadyDrawed) {
			areaLocationMappingUuidDrawComplete.push(areaOut.id + "_" + areaIn.id);
			if (doubleOrientation) {
				areaLocationMappingUuidDrawComplete.push(areaIn.id + "_" + areaOut.id);
			}

			var areaOutNodePosition = areaOut.position;
			var areaInNodePosition = areaIn.position;
			var idEdge = "arc_" + (areaOut.id + "_" + areaIn.id);
			var idEdgeInverse = "arc_" + (areaIn.id + "_" + areaOut.id);

			SvgChartHelper.chooseStrategyToCalculateCoordinatesForNodes(areaOut, areaIn, areaOutNodePosition, areaInNodePosition, doubleOrientation, idEdge, cardinalityEdge,locationUuidEdge,readerEdge, idEdgeInverse, cardinalityEdgeInverse,locationUuidIverseEdge,readerInverseEdge);

		}

	}

};


SvgChartHelper.chooseStrategyToCalculateCoordinatesForNodes = function (areaOut, areaIn, areaOutNodePosition, areaInNodePosition, doubleOrientation, idEdge, cardinalityEdge,locationUuidEdge,readerEdge, idEdgeInverse, cardinalityEdgeInverse,locationUuidIverseEdge,readerInverseEdge) {
	if (!doubleOrientation) {
		SvgChartEdgeHelper.calculateCoordinatesForEdge(areaOutNodePosition, areaInNodePosition, areaOut, areaIn, idEdge, cardinalityEdge,locationUuidEdge,readerEdge, null, null, null);
	}
	else if (doubleOrientation) {
		if (cardinalityEdge == 1 && cardinalityEdgeInverse == 1) {
			SvgChartEdgeHelper.calculateCoordinatesForEdge(areaOutNodePosition, areaInNodePosition, areaOut, areaIn, idEdge, cardinalityEdge,locationUuidEdge,readerEdge, idEdgeInverse, cardinalityEdgeInverse,locationUuidIverseEdge,readerInverseEdge, null); }
		else {
			var totCardinality = cardinalityEdge + cardinalityEdgeInverse;
			var plusLimit = Math.floor(totCardinality / 2);
			SvgChartEdgeHelper.calculateCoordinatesForEdge(areaOutNodePosition, areaInNodePosition, areaOut, areaIn, idEdge, cardinalityEdge,locationUuidEdge,readerEdge, idEdgeInverse, cardinalityEdgeInverse,locationUuidIverseEdge,readerInverseEdge,plusLimit);
		}

	}

};


SvgChartHelper.calculateCoordinateTopAndLeftInAnElement = function (generalIdLInk, element, widthNotification, heightNotification) {
	var position = $("#" + generalIdLInk + element).position();
	if ($("#" + generalIdLInk + element)[0] != null) {
		if ($("#" + generalIdLInk + element)[0].getBoundingClientRect() != null) {
			var offsetX = $("#" + generalIdLInk + element)[0].getBoundingClientRect().width / 2;
			var offsetY = $("#" + generalIdLInk + element)[0].getBoundingClientRect().height / 2;
			var idContent = element;
			var centerYBox = position.top + offsetY;
			var centerXBox = position.left + offsetX;
			var topOuterDiv = centerYBox - (heightNotification / 2);
			var leftOuterDiv = centerXBox - (widthNotification / 2);
			return {top: topOuterDiv, left: leftOuterDiv, idContent: idContent};
		}
	}

};

SvgChartHelper.calculateCoordinateAndOffsetOfCenterInAnElement = function (generalIdLInk, element) {
	var position = $("#" + generalIdLInk + element).position();
	if ($("#" + generalIdLInk + element)[0] != null) {
		if ($("#" + generalIdLInk + element)[0].getBoundingClientRect() != null) {
			var offsetX = $("#" + generalIdLInk + element)[0].getBoundingClientRect().width / 2;
			var offsetY = $("#" + generalIdLInk + element)[0].getBoundingClientRect().height / 2;

			var centerYBox = position.top + offsetY;
			var centerXBox = position.left + offsetX;
			return {x: centerXBox, y: centerYBox, offsetX: offsetX, offsetY: offsetY};
		}
	}
};


SvgChartHelper.calculateMidPointOfLineSegment = function(point1,point2) {
	var midXPoint = (point1.x + point2.x) / 2;
	var midYPoint = (point1.y + point2.y) / 2;
	return {x: midXPoint, y: midYPoint};
};









