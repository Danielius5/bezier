const c = document.getElementById("canvas");
const canvasWrapperRect = document.getElementById('wrapper').getBoundingClientRect();
const ctx = c.getContext("2d");
const CIRCLE_WIDENESS = 20;

c.height = canvasWrapperRect.height;
c.width = canvasWrapperRect.width;

ctx.strokeStyle = "#000000";
ctx.fillStyle = "#000000";

let supportPointsPositions = [];
let mouseMoved = false;

let currentlyDragged = null;


function drawFromPoints(points, thickness = 1, color = "#000") {
    for (const point of points) {
        drawCircle(ctx, point.x, point.y, thickness, color);
    }
}

// maybe will want to use this again!
// function drawAnimationFromPoints(points, thickness = 1, color = "#000", milliseconds = 1000) {
//     let pointsPerMillisec = points.length / milliseconds;
//     let millisecsToSleep;

//     if (pointsPerMillisec >= 1) {
//         millisecsToSleep = 1;
//     }

//     if (pointsPerMillisec < 1) {
//         pointsPerMillisec = 1;
//         millisecsToSleep = milliseconds / points.length;
//     }

//     let curLastPoint = 0;

//     let interv = setInterval(() => {
//         // console.log("drawing", pointsPerMillisec, millisecsToSleep)
//         const arr = points.slice(curLastPoint, curLastPoint + pointsPerMillisec);
//         curLastPoint += pointsPerMillisec;
//         if (arr.length == 0) {
//             clearInterval(interv);
//             return
//         }
//         drawFromPoints(arr)
//     }, millisecsToSleep)
// }

function drawCircle(ctx, x, y, radius, fill, stroke, strokeWidth) {
    ctx.beginPath()
    ctx.arc(x, y, radius, 0, 2 * Math.PI, false)
    if (fill) {
        ctx.fillStyle = fill
        ctx.fill()
    }
    if (stroke) {
        ctx.lineWidth = strokeWidth
        ctx.strokeStyle = stroke
        ctx.stroke()
    }
}

function getPointByPosition(points, x, y) {
    // incorrect, good enough for now
    return points.findIndex((p) => Math.abs(p.x - x) + Math.abs(p.y - y) < CIRCLE_WIDENESS * 3)
}

function redrawEverything() {
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height)

    let i = 1;
    do {
        drawSupportPointAndLine(supportPointsPositions[i - 1], supportPointsPositions[i]);
        i++;
    } while (i < supportPointsPositions.length)

    drawBezierFromSupportPoints(supportPointsPositions, 2, "#000", false);
}
function handleMouseMove(e) {

    if (currentlyDragged != -1) {
        mouseMoved = true;
        const p = supportPointsPositions[currentlyDragged];


        p.x = e.x;
        p.y = e.y;

        redrawEverything();
    }
}

function handleOnMouseDown(e) {
    mouseMoved = false;
    currentlyDragged = null;

    currentlyDragged = getPointByPosition(supportPointsPositions, e.x, e.y);

    document.getElementById("canvas").addEventListener("mousemove", handleMouseMove)
}

function drawSupportPointAndLine(newP, prevP) {
    try {
        drawBezierFromSupportPoints([newP, prevP], 0.5, "#a00", false);
        // redraw so line is not on top of point
        drawCircle(ctx, prevP.x, prevP.y, CIRCLE_WIDENESS, "#000000")

    } catch { }
    drawCircle(ctx, newP.x, newP.y, CIRCLE_WIDENESS, "#000000")
}

function handleOnMouseUp(e) {
    document.getElementById("canvas").removeEventListener("mousemove", handleMouseMove)

    if (!mouseMoved) {
        const prevP = supportPointsPositions.at(-1);
        const newP = { x: e.x, y: e.y };

        supportPointsPositions.push(newP);

        redrawEverything();

    }
}

function getBinomialCoefs(n) {
    if (n <= 1) {
        return [1]
    }

    const prev = getBinomialCoefs(n - 1);

    let nex = [1];
    for (let i = 1; i < n - 1; i++) {
        nex.push(prev[i - 1] + prev[i]);
    }
    nex.push(1);

    return nex;
}

function drawBezierFromSupportPoints(supportPoints, thickness = 2, color = "#000", animate = true) {
    if (supportPoints.length == 0) {
        return;
    }

    let diff = 0;
    for (let i = 1; i < supportPoints.length; i++) {
        diff = Math.max(
            diff,
            Math.abs(supportPoints[i - 1].x - supportPoints[i].x),
            Math.abs(supportPoints[i - 1].y - supportPoints[i].y),
        );
    }

    let incr = 1 / diff / supportPoints.length;


    let coefs = getBinomialCoefs(supportPoints.length)

    let points = [];


    for (let t = 0; t <= 1; t += incr) {
        let nextX = 0;
        let nextY = 0;

        for (const [k, p] of Object.entries(supportPoints)) {
            const mult = coefs[k] * Math.pow((1 - t), supportPoints.length - 1 - k) * Math.pow(t, k);

            nextX += mult * p.x;
            nextY += mult * p.y;
        }

        points.push({ x: nextX, y: nextY });
    }
    if (animate) {
        drawAnimationFromPoints(points, thickness, color, 500);
    } else {
        drawFromPoints(points, thickness, color);
    }
}

function deleteEverything() {
    supportPointsPositions = []
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
}