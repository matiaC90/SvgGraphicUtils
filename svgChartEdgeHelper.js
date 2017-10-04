var SvgChartEdgeHelper = {};
SvgChartEdgeHelper.globalMapEdgeStorage = {};
var multiplyK = 15;

SvgChartEdgeHelper.calculateDynamicOffsetInEllipse = function (angleDegreeAreaOut, angleDegreeAreaIn, iteration, plusLimit) {
	var calculatedOffsetAreaOut = null;
	var calculatedOffsetAreaIn = null;
	var added = iteration % 2 == 0;
	if (plusLimit != null) {
		added = iteration < plusLimit;
	}
	if (added) {
		calculatedOffsetAreaOut = angleDegreeAreaOut + globalAngleOffset + (multiplyK * iteration);
		calculatedOffsetAreaIn = angleDegreeAreaIn - globalAngleOffset - (multiplyK * iteration);


	}
	else {
		calculatedOffsetAreaOut = angleDegreeAreaOut - globalAngleOffset - (multiplyK * iteration);
		calculatedOffsetAreaIn = angleDegreeAreaIn + globalAngleOffset + (multiplyK * iteration);

	}

	var offsets = {areaOutOffset: calculatedOffsetAreaOut, areaInOffset: calculatedOffsetAreaIn};

	return offsets;
};


SvgChartEdgeHelper.getCoordinatesOfMutipleEdges = function (intersectedPointOfNode1, intersectedPointOfNode2, areaOut, areaIn, idEdge, cardinalityEdge, locationUuidEdge, readerEdge, idEdgeInverse, cardinalityEdgeInverse, locationUuidIverseEdge, readerInverseEdge, plusLimit) {


	var pointAreOutWithCalculatedOffset = null;
	var pointAreaInWithCalculatedOffset = null;
	var areaOutPosition = areaOut.position;
	var areaInPosition = areaIn.position;
	var points = [];
	var isThereARectangularNode = false;
	var bothRectangularNodes = false;
	var isThereARectangularNode = areaOut.shape != "ellipse" || areaIn.shape != "ellipse";
	var bothRectangularNodes = areaOut.shape != "ellipse" && areaIn.shape != "ellipse";

	var totCardinality = cardinalityEdge;
	if (cardinalityEdgeInverse != null) {
		totCardinality += cardinalityEdgeInverse;
	}

	for (var i = 0; i < totCardinality; i++) {

		if (!isThereARectangularNode) {
			var angleDegreeAreaOut = SvgGoniometricChartHelper.getAngleFromInterceptPointAndCenter(intersectedPointOfNode1, areaOutPosition);
			var angleDegreeAreaIn = SvgGoniometricChartHelper.getAngleFromInterceptPointAndCenter(intersectedPointOfNode2, areaInPosition);
			var radius = areaOut.width / 2;

			var resultAngles = SvgChartEdgeHelper.calculateDynamicOffsetInEllipse(angleDegreeAreaOut, angleDegreeAreaIn, i, plusLimit);

			var radiansAdterOffsetAreaOut = SvgGoniometricChartHelper.convertAngleDegreeToRadians(resultAngles.areaOutOffset);
			var radiansAdterOffsetAreaIn = SvgGoniometricChartHelper.convertAngleDegreeToRadians(resultAngles.areaInOffset);

			var pointEllipse1 = {
				x: SvgGoniometricChartHelper.getSignedXFromRadiusAndXCenterAndTheta(radius, areaOutPosition.x, radiansAdterOffsetAreaOut),
				y: SvgGoniometricChartHelper.getSignedYFromRadiusAndXCenterAndTheta(radius, areaOutPosition.y, radiansAdterOffsetAreaOut)
			};

			var pointEllipse2 = {
				x: SvgGoniometricChartHelper.getSignedXFromRadiusAndXCenterAndTheta(radius, areaInPosition.x, radiansAdterOffsetAreaIn),
				y: SvgGoniometricChartHelper.getSignedYFromRadiusAndXCenterAndTheta(radius, areaInPosition.y, radiansAdterOffsetAreaIn)
			};
			var array = [];
			array.push(pointEllipse1);
			array.push(pointEllipse2);
			points.push(array);

		}
		else {
			points.push(SvgChartEdgeHelper.calculatePointsIfThereIsRectangle(i, areaOut, areaIn, intersectedPointOfNode1, intersectedPointOfNode2, plusLimit, bothRectangularNodes));

		}

	}

	if (SvgChartEdgeHelper.checkNotValidInterceptionsOnArrayJustCalculated(points)) {
		return;
	}
	var isAreaOutEllipse = areaOut.shape == "ellipse";
	SvgChartEdgeHelper.drawEdge(points, totCardinality, areaOut, areaIn, idEdge, cardinalityEdge, locationUuidEdge, readerEdge, idEdgeInverse, cardinalityEdgeInverse, locationUuidIverseEdge, readerInverseEdge, plusLimit,isAreaOutEllipse);

};


SvgChartEdgeHelper.calculateMinorSideOfRectangle = function (allRectangleSides) {
	//length
	var sizeSideA = Math.sqrt(Math.pow((allRectangleSides.bottomRight.x - allRectangleSides.bottomLeft.x), 2));
	//height
	var sizeSideB = Math.sqrt(Math.pow((allRectangleSides.topLeft.y - allRectangleSides.bottomLeft.y), 2));

	return (sizeSideA < sizeSideB) ? sizeSideA : sizeSideB;
};

SvgChartEdgeHelper.calculateInterceptPointsInImmaginaryCircle = function (areaRectangle, areaRectanglePosition, areaNode2Position) {
	var xC = (areaRectanglePosition.x - ((areaRectangle.width * 1.2) / 2));
	var yC = (areaRectanglePosition.y - ((areaRectangle.height * 1.2) / 2));
	var xD = (areaRectanglePosition.x + ((areaRectangle.width * 1.2) / 2));
	var yD = (areaRectanglePosition.y + ((areaRectangle.height * 1.2) / 2));

	var allRectangleSides = {bottomLeft: new Point2D(xC, yD), topLeft: new Point2D(xC, yC), topRight: new Point2D(xD, yC), bottomRight: new Point2D(xD, yD)};

	var minorSideRectangle = SvgChartEdgeHelper.calculateMinorSideOfRectangle(allRectangleSides);
	var radiusImmaginaryEllipse = Math.floor(minorSideRectangle / 2);

	//find immaginary line that intercept immaginary circle(in rectangular) with circle
	var pointInterceptingImmaginaryCircle = Intersection.intersectCircleLine({
			x: areaRectanglePosition.x,
			y: areaRectanglePosition.y
		}, radiusImmaginaryEllipse, new Point2D(areaRectanglePosition.x, areaRectanglePosition.y),
		new Point2D(areaNode2Position.x, areaNode2Position.y)).points[0];

	return {point: pointInterceptingImmaginaryCircle, sides: allRectangleSides, radius: radiusImmaginaryEllipse};
};

SvgChartEdgeHelper.calculateInterceptPointWithOffsetIfThereIsRectangle = function (intersectPointEllipse, areaEllipsePosition, pointInterceptingImmaginaryCircle, areaRectanglePosition, iteration, plusLimit, radiusReallyEllipse, radiusImmaginaryEllipse, allRectangleSides) {

	var angleDegreeAreaEllipse = SvgGoniometricChartHelper.getAngleFromInterceptPointAndCenter(intersectPointEllipse, areaEllipsePosition);
	var angleDegreeAreaImmaginaryEllipse = SvgGoniometricChartHelper.getAngleFromInterceptPointAndCenter(pointInterceptingImmaginaryCircle, areaRectanglePosition);

	var resultAngles = SvgChartEdgeHelper.calculateDynamicOffsetInEllipse(angleDegreeAreaEllipse, angleDegreeAreaImmaginaryEllipse, iteration, plusLimit);

	var radiansAdterOffsetAreaReallyEllipse = SvgGoniometricChartHelper.convertAngleDegreeToRadians(resultAngles.areaOutOffset);
	var radiansAdterOffsetAreaImmaginaryEllipse = SvgGoniometricChartHelper.convertAngleDegreeToRadians(resultAngles.areaInOffset);

	//point on really ellipse
	var pointReallyEllipseWithCalculatedOffset = new Point2D(SvgGoniometricChartHelper.getSignedXFromRadiusAndXCenterAndTheta(radiusReallyEllipse, areaEllipsePosition.x, radiansAdterOffsetAreaReallyEllipse),
		SvgGoniometricChartHelper.getSignedYFromRadiusAndXCenterAndTheta(radiusReallyEllipse, areaEllipsePosition.y, radiansAdterOffsetAreaReallyEllipse));

	//point on immaginary ellipse
	var pointImmaginaryEllipseInWithCalculatedOffset = {
		x: SvgGoniometricChartHelper.getSignedXFromRadiusAndXCenterAndTheta(radiusImmaginaryEllipse, areaRectanglePosition.x, radiansAdterOffsetAreaImmaginaryEllipse),
		y: SvgGoniometricChartHelper.getSignedYFromRadiusAndXCenterAndTheta(radiusImmaginaryEllipse, areaRectanglePosition.y, radiansAdterOffsetAreaImmaginaryEllipse)
	};

	//parametri : punto inizio linea, punto fine line, lato topleft, lato bottomright
	var pointReallyOfRectangleInWithCalculatedOffset = Intersection.intersectLineRectangle({
		x: pointImmaginaryEllipseInWithCalculatedOffset.x,
		y: pointImmaginaryEllipseInWithCalculatedOffset.y
	}, {
		x: areaEllipsePosition.x,
		y: areaEllipsePosition.y
	}, allRectangleSides.topLeft, allRectangleSides.bottomRight).points[0];
	return {pointReallyEllipseWithCalculatedOffset: pointReallyEllipseWithCalculatedOffset, pointReallyOfRectangleInWithCalculatedOffset: pointReallyOfRectangleInWithCalculatedOffset};
};


SvgChartEdgeHelper.calculateInterceptPointWithOffsetIfThereAreBothRectangle = function (pointInterceptingImmaginaryCircle, areaRectanglePosition, pointInterceptingImmaginaryCircleTwo, areaRectangleTwoPosition, iteration, plusLimit, radiusImmaginaryEllipse, radiusImmaginaryEllipseTwo, allRectangleSides, allRectangleSidesTwo) {

	var angleDegreeAreaImmaginaryEllipse = SvgGoniometricChartHelper.getAngleFromInterceptPointAndCenter(pointInterceptingImmaginaryCircle, areaRectanglePosition);
	var angleDegreeAreaImmaginaryEllipseTwo = SvgGoniometricChartHelper.getAngleFromInterceptPointAndCenter(pointInterceptingImmaginaryCircleTwo, areaRectangleTwoPosition);

	var resultAngles = SvgChartEdgeHelper.calculateDynamicOffsetInEllipse(angleDegreeAreaImmaginaryEllipse, angleDegreeAreaImmaginaryEllipseTwo, iteration, plusLimit);

	var radiansAdterOffsetAreaImmaginaryEllipse = SvgGoniometricChartHelper.convertAngleDegreeToRadians(resultAngles.areaOutOffset);
	var radiansAdterOffsetAreaImmaginaryEllipseTwo = SvgGoniometricChartHelper.convertAngleDegreeToRadians(resultAngles.areaInOffset);

	//point on immaginary ellipse
	var pointImmaginaryEllipseInWithCalculatedOffset = {
		x: SvgGoniometricChartHelper.getSignedXFromRadiusAndXCenterAndTheta(radiusImmaginaryEllipse, areaRectanglePosition.x, radiansAdterOffsetAreaImmaginaryEllipse),
		y: SvgGoniometricChartHelper.getSignedYFromRadiusAndXCenterAndTheta(radiusImmaginaryEllipse, areaRectanglePosition.y, radiansAdterOffsetAreaImmaginaryEllipse)
	};

	//parametri : punto inizio linea, punto fine line, lato topleft, lato bottomright
	var pointReallyOfRectangleInWithCalculatedOffset = Intersection.intersectLineRectangle({
		x: pointImmaginaryEllipseInWithCalculatedOffset.x,
		y: pointImmaginaryEllipseInWithCalculatedOffset.y
	}, {
		x: areaRectangleTwoPosition.x,
		y: areaRectangleTwoPosition.y
	}, allRectangleSides.topLeft, allRectangleSides.bottomRight).points[0];

	//point on immaginary ellipse
	var pointImmaginaryEllipseInWithCalculatedOffsetTwo = {
		x: SvgGoniometricChartHelper.getSignedXFromRadiusAndXCenterAndTheta(radiusImmaginaryEllipseTwo, areaRectangleTwoPosition.x, radiansAdterOffsetAreaImmaginaryEllipseTwo),
		y: SvgGoniometricChartHelper.getSignedYFromRadiusAndXCenterAndTheta(radiusImmaginaryEllipseTwo, areaRectangleTwoPosition.y, radiansAdterOffsetAreaImmaginaryEllipseTwo)
	};

	//parametri : punto inizio linea, punto fine line, lato topleft, lato bottomright
	var pointReallyOfRectangleInWithCalculatedOffsetTwo = Intersection.intersectLineRectangle({
		x: pointImmaginaryEllipseInWithCalculatedOffsetTwo.x,
		y: pointImmaginaryEllipseInWithCalculatedOffsetTwo.y
	}, {
		x: areaRectanglePosition.x,
		y: areaRectanglePosition.y
	}, allRectangleSidesTwo.topLeft, allRectangleSidesTwo.bottomRight).points[0];

	return {
		pointReallyOfRectangleInWithCalculatedOffset: pointReallyOfRectangleInWithCalculatedOffset,
		pointReallyOfRectangleInWithCalculatedOffsetTwo: pointReallyOfRectangleInWithCalculatedOffsetTwo
	};
};

SvgChartEdgeHelper.calculatePointsIfThereIsRectangle = function (iteration, areaOut, areaIn, intersectedPointOfNode1, intersectedPointOfNode2, plusLimit, bothRectangularNodes) {

	var pointNodeWithCalculatedOffset = [];

	if (!bothRectangularNodes) {

		var areaEllipse = (areaOut.shape == "ellipse") ? areaOut : areaIn;
		var areaRectangle = (areaOut.shape != "ellipse") ? areaOut : areaIn;
		var areaEllipsePosition = areaEllipse.position;
		var areaRectanglePosition = areaRectangle.position;
		var intersectPointEllipse = (areaOut.shape == "ellipse") ? intersectedPointOfNode1 : intersectedPointOfNode2;
		var intersectPointRectangle = (areaOut.shape != "ellipse") ? intersectedPointOfNode1 : intersectedPointOfNode2;
		var radiusReallyEllipse = areaEllipse.width / 2;

		if (!intersectPointRectangle || !intersectPointEllipse) {
			return;
		}

		var immaginaryCircle = SvgChartEdgeHelper.calculateInterceptPointsInImmaginaryCircle(areaRectangle, areaRectanglePosition, areaEllipsePosition);
		var radiusImmaginaryEllipse = immaginaryCircle.radius;
		var allRectangleSides = immaginaryCircle.sides;
		var pointInterceptingImmaginaryCircle = immaginaryCircle.point;

		var __ret = SvgChartEdgeHelper.calculateInterceptPointWithOffsetIfThereIsRectangle(intersectPointEllipse, areaEllipsePosition, pointInterceptingImmaginaryCircle, areaRectanglePosition, iteration, plusLimit, radiusReallyEllipse, radiusImmaginaryEllipse, allRectangleSides);
		pointNodeWithCalculatedOffset.push(__ret.pointReallyEllipseWithCalculatedOffset);
		pointNodeWithCalculatedOffset.push(__ret.pointReallyOfRectangleInWithCalculatedOffset);
	}
	else {

		var areaRectangle = areaOut;
		var areaRectangleTwo = areaIn;
		var areaRectanglePosition = areaRectangle.position;
		var areaRectangleTwoPosition = areaRectangleTwo.position;
		var intersectPointRectangle = intersectedPointOfNode1;
		var intersectPointRectangleTwo = intersectedPointOfNode2;

		if (!intersectPointRectangle || !intersectPointRectangleTwo) {
			return;
		}

		var immaginaryCircle = SvgChartEdgeHelper.calculateInterceptPointsInImmaginaryCircle(areaRectangle, areaRectanglePosition, areaRectangleTwoPosition);
		var radiusImmaginaryEllipse = immaginaryCircle.radius;
		var allRectangleSides = immaginaryCircle.sides;
		var pointInterceptingImmaginaryCircle = immaginaryCircle.point;

		var immaginaryCircleTwo = SvgChartEdgeHelper.calculateInterceptPointsInImmaginaryCircle(areaRectangleTwo, areaRectangleTwoPosition, areaRectanglePosition);
		var radiusImmaginaryEllipseTwo = immaginaryCircleTwo.radius;
		var allRectangleSidesTwo = immaginaryCircleTwo.sides;
		var pointInterceptingImmaginaryCircleTwo = immaginaryCircleTwo.point;

		var __ret = SvgChartEdgeHelper.calculateInterceptPointWithOffsetIfThereAreBothRectangle(pointInterceptingImmaginaryCircle, areaRectanglePosition, pointInterceptingImmaginaryCircleTwo, areaRectangleTwoPosition, iteration, plusLimit, radiusImmaginaryEllipse, radiusImmaginaryEllipseTwo, allRectangleSides, allRectangleSidesTwo);
		pointNodeWithCalculatedOffset.push(__ret.pointReallyOfRectangleInWithCalculatedOffset);
		pointNodeWithCalculatedOffset.push(__ret.pointReallyOfRectangleInWithCalculatedOffsetTwo);

	}

	return pointNodeWithCalculatedOffset;
};

SvgChartEdgeHelper.checkNotValidInterceptionsOnArrayJustCalculated = function (listPoints) {
	for (var i = 0; i < listPoints.length; i++) {
		for (var j = 0; j < listPoints[i].length; j++) {
			if (listPoints[i][j] == undefined || listPoints[i][j] == null) {
				return true;
			}
		}
	}
	return false;
}

SvgChartEdgeHelper.checkNotValidInterceptionsJustCalculated = function (intersectedPointOfNode1, intersectedPointOfNode2) {
	return !intersectedPointOfNode1 || !intersectedPointOfNode2;
};


SvgChartEdgeHelper.calculateIntersectPointByShape = function (node, nodePosition, node2Position) {
	var intersectPointArea = null;
	if (node.shape == "ellipse") {
		//parametri : centro, raggio, punto inizio linea, punto fine line
		intersectPointArea = Intersection.intersectCircleLine({
				x: nodePosition.x,
				y: nodePosition.y
			}, node.width / 2, new Point2D(nodePosition.x, nodePosition.y),
			new Point2D(node2Position.x, node2Position.y)).points[0];
	} else {
		//parametri : punto inizio linea, punto fine line, lato topleft, lato bottomright
		xC = (nodePosition.x - ((node.width * 1.2) / 2));
		yC = (nodePosition.y - ((node.height * 1.2) / 2));
		xD = (nodePosition.x + ((node.width * 1.2) / 2));
		yD = (nodePosition.y + ((node.height * 1.2) / 2));

		var rectangleSides = {c: new Point2D(xC, yC), d: new Point2D(xD, yD)};
		intersectPointArea = Intersection.intersectLineRectangle({x: nodePosition.x, y: nodePosition.y}, {
			x: node2Position.x,
			y: node2Position.y
		}, rectangleSides.c, rectangleSides.d).points[0];
	}

	return intersectPointArea;
};

SvgChartEdgeHelper.getIntersectedPointsOfNodesByShape = function (areaOut, areaIn, areaOutNodePosition, areaInNodePosition) {
	var intersectedPointOfAreaOut = null;
	var intersectedPointOfAreaIn = null;
	var interceptedPoints = {};


	intersectedPointOfAreaOut = SvgChartEdgeHelper.calculateIntersectPointByShape(areaOut, areaOutNodePosition, areaInNodePosition);
	intersectedPointOfAreaIn = SvgChartEdgeHelper.calculateIntersectPointByShape(areaIn, areaInNodePosition, areaOutNodePosition);

	interceptedPoints.areaOut = intersectedPointOfAreaOut;
	interceptedPoints.areaIn = intersectedPointOfAreaIn;

	return interceptedPoints;

};

SvgChartEdgeHelper.calculateCoordinatesForEdge = function (areaOutNodePosition, areaInNodePosition, areaOut, areaIn, idEdge, cardinalityEdge, locationUuidEdge, readerEdge, idEdgeInverse, cardinalityEdgeInverse, locationUuidIverseEdge, readerInverseEdge, plusLimit) {
	var intersectedPointOfNode1 = null;
	var listIntersectedPointsOfNode1WithMultipleEdges = null;
	var intersectedPointOfNode2 = null;
	var listIntersectedPointOfNode2WithMultipleEdges = null;
	var hasInverse = cardinalityEdgeInverse;
	var rectangleSides = null;

	var intersectedPoints = SvgChartEdgeHelper.getIntersectedPointsOfNodesByShape(areaOut, areaIn, areaOutNodePosition, areaInNodePosition);
	if (intersectedPoints.areaOut != null && intersectedPoints.areaIn != null) {
		SvgChartEdgeHelper.getCoordinatesOfMutipleEdges(intersectedPoints.areaOut, intersectedPoints.areaIn, areaOut, areaIn, idEdge, cardinalityEdge, locationUuidEdge, readerEdge, idEdgeInverse, cardinalityEdgeInverse, locationUuidIverseEdge, readerInverseEdge, plusLimit);
	}

};

SvgChartEdgeHelper.getSimpleCoordinateOfEdge = function (firstNode, secondNode) {
	var inNodePosition = firstNode.position;
	var outNodePosition = secondNode.position;
	var points = [];
	if (firstNode.shape == "ellipse") {
		points[0] = Intersection.intersectCircleLine({
				x: inNodePosition.x,
				y: inNodePosition.y
			}, firstNode.width / 2, new Point2D(inNodePosition.x, inNodePosition.y),
			new Point2D(outNodePosition.x, outNodePosition.y)).points[0];

	}
	else {
		var xC = (firstNode.x - ((firstNode.width * 1.2 ) / 2));
		var yC = (firstNode.y - ((firstNode.height * 1.2) / 2));
		var xD = (firstNode.x + ((firstNode.width * 1.2) / 2));
		var yD = (firstNode.y + ((firstNode.height * 1.2) / 2));

		var rectangleSides = {c: new Point2D(xC, yC), d: new Point2D(xD, yD)};
		points[0] = Intersection.intersectLineRectangle({x: inNodePosition.x, y: inNodePosition.y}, {
			x: outNodePosition.x,
			y: outNodePosition.y
		}, rectangleSides.c, rectangleSides.d).points[0];
		points[1] = rectangleSides;

	}
	return points;

};


SvgChartEdgeHelper.chooseDirectPathToWriteCorrectLocation = function(intersectedPointOfNode1,intersectedPointOfNode2, startNode, areaIn) {
	if (startNode.shape == "ellipse") {
		if (intersectedPointOfNode1.x > intersectedPointOfNode2.x) {
			return false;
		}
	}
	else {
		//rectangle
		if (areaIn.shape == "ellipse") {
			if (intersectedPointOfNode2.x < intersectedPointOfNode1.x) {
				return false;
			}
		}
		else {
			if (intersectedPointOfNode1.x > intersectedPointOfNode2.x) {
				return false;
			}
		}

	}
	return true;
};


SvgChartEdgeHelper.drawEdge = function (interceptPoints, totCardinality, areaOut, areaIn, idEdge, cardinalityEdge, locationUuidEdge, readerEdge, idEdgeInverse, cardinalityEdgeInverse, locationUuidIverseEdge, readerInverseEdge, plusLimit,isAreaOutEllipse) {

	var intersectedPointOfNode1 = null;
	var intersectedPointOfNode2 = null;

	var lineData = [];
	var lineDataInverse = [];
	var lineGenerator = null;
	var pathString = null;
	var pathDirectString = null;
	var pathInverseString = null;

	var idCompleteEdge = "";
	var allInformationsDirectEdge = globalMapEdgesLocationAndReader[areaOut.id + "_" + areaIn.id];
	var allInformationsInverseEdge = globalMapEdgesLocationAndReader[areaIn.id + "_" + areaOut.id];
	var informationEdge = null;
	var indexDirectForAssociation = 0;
	var indexInverseForAssociation = 0;


	for (var i = 0; i < interceptPoints.length; i++) {

			intersectedPointOfNode1 = interceptPoints[i][0];
			intersectedPointOfNode2 = interceptPoints[i][1];


		var path = svgGlobalContainer.path("M 0 0 L 10 5 L 0 10 z");
		path.attr({
			fill: "#BBBBBB"
		});


		var marker = path.marker(0, 0, 10, 12, 10, 5);
		marker.attr({
			viewBox: "0 0 10 10",
			markerUnits: "userSpaceOnUse"

		});
		var idCompleteEdge = "";

		lineData = [[intersectedPointOfNode1.x, intersectedPointOfNode1.y], [intersectedPointOfNode2.x, intersectedPointOfNode2.y]];
		lineDataInverse = [[intersectedPointOfNode2.x, intersectedPointOfNode2.y], [intersectedPointOfNode1.x, intersectedPointOfNode1.y]];
		lineGenerator = d3.svg.line();

		pathDirectString = lineGenerator(lineData);
		pathInverseString = lineGenerator(lineDataInverse);
		var pathString = (SvgChartEdgeHelper.chooseDirectPathToWriteCorrectLocation(intersectedPointOfNode1, intersectedPointOfNode2, areaOut, areaIn) == true) ? pathDirectString : pathInverseString;


		if (i < cardinalityEdge) {

			informationEdge = allInformationsDirectEdge[indexDirectForAssociation];
			idCompleteEdge = idEdge + "_" + informationEdge.locationUuid + "_" + informationEdge.reader;

			svgGlobalContainer.line(intersectedPointOfNode1.x, intersectedPointOfNode1.y, intersectedPointOfNode2.x, intersectedPointOfNode2.y).attr({
				id: idCompleteEdge,
				stroke: '#BBBBBB',
				strokeWidth: 2,
				markerEnd: marker
			});
			SvgChartEdgeHelper.globalMapEdgeStorage [idCompleteEdge] = {
				areaIn: new Point2D(intersectedPointOfNode2.x, intersectedPointOfNode2.y),
				areaOut: new Point2D(intersectedPointOfNode1.x, intersectedPointOfNode1.y)
			}

			indexDirectForAssociation++;
		}
		else {

			informationEdge = allInformationsInverseEdge[indexInverseForAssociation];
			idCompleteEdge = idEdgeInverse + "_" + informationEdge.locationUuid + "_" + informationEdge.reader;

			svgGlobalContainer.line(intersectedPointOfNode2.x, intersectedPointOfNode2.y, intersectedPointOfNode1.x, intersectedPointOfNode1.y).attr({
				id: idCompleteEdge,
				stroke: '#BBBBBB',
				strokeWidth: 2,
				markerEnd: marker
			});
			SvgChartEdgeHelper.globalMapEdgeStorage [idCompleteEdge] = {
				areaIn: new Point2D(intersectedPointOfNode1.x, intersectedPointOfNode1.y),
				areaOut: new Point2D(intersectedPointOfNode2.x, intersectedPointOfNode2.y)
			};
			indexInverseForAssociation++;
		}

		var pathText = svgGlobalContainer.path(pathString).attr({
			fill: "none",
			width:"100%",
			height: "100%",
			id: "path_" + idCompleteEdge,
			'startOffset': '50%'
		})

		var label = svgGlobalContainer.text(0, 0, informationEdge.label).attr({
			'font-size': 15,
			'font-family': "Verdana, sans-serif",
			'text-anchor': "middle",
			'textpath': pathText
		});

		label.textPath.attr({ startOffset: '50%' });

	}
};



