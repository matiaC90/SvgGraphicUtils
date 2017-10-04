var SvgGoniometricChartHelper = {};

SvgGoniometricChartHelper.getSignedXFromRadiusAndXCenterAndTheta = function (radius, xCenter, theta) {
	return (xCenter + (radius * Math.cos(theta)));
};

SvgGoniometricChartHelper.getSignedYFromRadiusAndXCenterAndTheta = function (radius, yCenter, theta) {
	return (yCenter + (radius * Math.sin(theta)));
};

//
// SvgGoniometricChartHelper.isMovingX = function (areaRectangleCenterY,areaEllipseCenterY, offsetkY, topLeftRectangleSideAreaY) {
// 	if (areaRectangleCenterY <= (areaEllipseCenterY - offsetkY) && (areaRectangleCenterY - offsetkY > topLeftRectangleSideAreaY)) {
// 		return false;
// 	}
// 	else {
// 		return true;
// 	}
//
// };

SvgGoniometricChartHelper.getAngleFromInterceptPointAndCenter = function (pointIntersect, center) {
	var dy = (pointIntersect.y - center.y),
		dx = (pointIntersect.x - center.x);
	var theta = Math.atan2(dy, dx);
	var angle = (((theta * 180) / Math.PI)) % 360;
	angle = (angle < 0) ? 360 + angle : angle;
	return angle;
};

SvgGoniometricChartHelper.convertAngleRadiansToDegree = function (angle) {
	return angle * (180 / Math.PI);
};

SvgGoniometricChartHelper.convertAngleDegreeToRadians = function (angle) {
	return angle * (Math.PI / 180);
};

