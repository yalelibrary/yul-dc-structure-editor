import { faAdd, faRefresh, faRemove } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Button, Divider } from 'antd';
import React, { MouseEvent, MouseEventHandler, useEffect, useRef, useState } from 'react';
import { Position } from '../utils/IIIFUtils';

class PartialCanvasSelectorProps {
    imageId?: string;
    maxWidthHeight!: number;
    onSvgSelected?: (polygons: Position[][]) => void;
};

function PartialCanvasSVGSelector({ imageId, maxWidthHeight, onSvgSelected }: PartialCanvasSelectorProps) {

    const [mouseIsDown, setMouseIsDown] = useState<boolean>(false);
    const [mousePosition, setMousePosition] = useState<Position | null>(null);
    const [svgPolygons, setSvgPolygons] = useState<Position[][]>([[]]);
    let imageRef = useRef<HTMLImageElement>(null);
    let imageCanvas = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        if (imageCanvas.current && imageRef.current && (imageCanvas.current.width !== imageRef.current.offsetWidth || imageCanvas.current.clientHeight !== imageRef.current.offsetHeight)) { //resize canvas if necessary
            imageCanvas.current.style.width = imageRef.current.offsetWidth + "px";
            imageCanvas.current.style.height = imageRef.current.offsetHeight + "px";
            imageCanvas.current.width = imageRef.current.offsetWidth;
            imageCanvas.current.height = imageRef.current.offsetHeight;
            imageCanvas.current.style.top = imageRef.current.offsetTop + "px";
            imageCanvas.current.style.left = imageRef.current.offsetLeft + "px";
        }
        if (imageCanvas.current) {
            const context = imageCanvas.current.getContext('2d');
            if (context) {
                context.clearRect(0, 0, imageCanvas.current.width, imageCanvas.current.height);
                context.lineWidth = 5;
                context.lineJoin = "round";
                for (let svgPositions of svgPolygons) {
                    let last = svgPositions === svgPolygons[svgPolygons.length - 1];
                    context.strokeStyle = last ? 'red' : "#c44";
                    if (svgPositions.length > 0) {
                        context.beginPath();
                        context.moveTo(svgPositions[0].x, svgPositions[0].y);
                        for (let i = 1; i < svgPositions.length; i++) {
                            context.lineTo(svgPositions[i].x, svgPositions[i].y);
                        }
                        context.closePath();
                        context.stroke();

                        context.strokeStyle = 'blue';
                        context.fillStyle = 'orange';
                        let m = 8;

                        let closest = mousePosition && closestPosition(svgPositions, mousePosition);

                        for (let i = 0; i < svgPositions.length; i++) {
                            let pos = svgPositions[i];
                            context.beginPath();
                            context.fillStyle = 'green';
                            context.strokeStyle = 'blue';
                            if (closest && closest.position === pos && closest.distance < m && mousePosition) {
                                context.fillStyle = 'orange';
                                context.strokeStyle = '#30F';
                            }
                            context.arc(pos.x, pos.y, 5, 0, 2 * Math.PI, true);
                            context.fill();
                            context.stroke();
                        }
                    }
                }
            }
        }
    }, [svgPolygons, mousePosition]);

    // clear selection when image changes.
    useEffect(() => {
        setSvgPolygons([[]]);
    }, [imageId]);


    if (!imageId) return <>No Image Selected</>
    let imageIdComponents = imageId.split("/");
    imageIdComponents[imageIdComponents.length - 3] = `!${maxWidthHeight},${maxWidthHeight}`;
    let imgSrc = imageIdComponents.join("/");

    const extractMousePosition = (event: any): Position => {
        let rect = imageRef.current!.getBoundingClientRect();
        let x = Math.min(Math.max(event.clientX - rect.left, 0), imageRef.current!.offsetWidth);
        let y = Math.min(Math.max(event.clientY - rect.top, 0), imageRef.current!.offsetHeight);
        return { x, y }
    }

    const handleMouseDown = (event: any) => {
        setMouseIsDown(true);
        let p = extractMousePosition(event);
        // if it's near an existing point, reorder positions so that it's last, otherwise add a new one
        let m = 8;
        let svgPositions = svgPolygons[svgPolygons.length - 1];
        let closest = closestPosition(svgPositions, p);
        if (closest && closest.distance < m) {
            // move close one to the end of the list and start moving it
            let newPositions: Position[] = moveToEnd(svgPositions, closest.index);
            let newPolygons = [...svgPolygons];
            newPolygons[newPolygons.length - 1] = newPositions;
            setSvgPolygons(newPolygons);
            return;
        }


        let polygons: Position[][] = [];
        let newPositions: Position[] = [];
        for (let svgPositions of svgPolygons) {
            let closest = closestPosition(svgPositions, p);
            if (closest && closest.distance < m) {
                // found a close one from another polygon
                newPositions = moveToEnd(svgPositions, closest.index);
            } else {
                polygons.push(svgPositions);
            }
        };
        if (newPositions && newPositions.length > 0) {
            polygons.push(newPositions);
            setSvgPolygons(polygons);
            return;
        }

        // swap the list around so that the new one will be between correct two points
        let closestByLineSegment = closestPositionBySegment(svgPositions, p);
        let arr = [...svgPositions];
        if (closestByLineSegment) {
            arr = moveToEnd(arr, closestByLineSegment.index);
        }
        arr.push(p);
        let newPolygons = [...svgPolygons];
        newPolygons[newPolygons.length - 1] = arr;
        setSvgPolygons(newPolygons);
        return;
    }


    const moveToEnd = (items: any[], i: number): any[] => {
        let newItems: any[];
        if (i === 0) {
            newItems = items.slice(1);
        } else if (i + 1 < items.length) {
            newItems = items.slice(i + 1);
            newItems = newItems.concat(items.slice(0, i));
        } else {
            return items; // already last, leave as is
        }
        newItems.push(items[i]);
        return newItems;
    }

    const closestPosition = (positions: Position[], point: Position): any => {
        let pwd = positions.map((p, i) => svgPositionToPositionAndDistance(p, point, i));
        pwd = pwd.sort((a, b) => a.distance - b.distance);
        return pwd[0];
    }

    const closestPositionBySegment = (positions: Position[], point: Position): any => {
        let pwd = positions.map((p, i) => svgPositionSegmentToPositionAndDistance(positions, point, i)).filter((p) => p);
        pwd = pwd.sort((a, b) => a.distance - b.distance);
        return pwd[0];
    }

    const svgPositionToPositionAndDistance = (position: Position, point: Position, index: number): any => {
        let distance = distanceBetweenPositions(position, point);
        return {
            distance: distance,
            position: position,
            index: index
        }
    }

    const distanceBetweenPositions = (position1: Position, position2: Position): number => {
        return Math.sqrt((position1.x - position2.x) * (position1.x - position2.x) + (position1.y - position2.y) * (position1.y - position2.y));
    }

    // distance betweeen point and the line created by positions[index] and the next position (looping to the beginning of the list).
    // if the distace between the point either of the two endpoints > length of the segment, don't count it.
    const svgPositionSegmentToPositionAndDistance = (positions: Position[], point: Position, index: number): any => {
        let position = positions[index];
        let position2 = (index + 1 < positions.length) ? positions[index + 1] : positions[0];
        // Two points into the form Ax + By + c = 0
        // Is: (y1 – y2)x + (x2 – x1)y + (x1y2 – x2y1) = 0
        let a = position.y - position2.y;
        let b = position2.x - position.x;
        let c = (position.x * position2.y) - (position2.x * position.y);
        let d = Math.abs(a * point.x + b * point.y + c) / Math.sqrt((a * a) + (b * b));

        let dp1 = distanceBetweenPositions(position, point);
        let dp2 = distanceBetweenPositions(position2, point);
        let segment = distanceBetweenPositions(position, position2);

        if (dp1 <= segment && dp2 <= segment) {
            return {
                distance: d,
                position: position,
                index: index
            }
        }

        return null;
    }

    const handleMouseMove = (event: any) => {
        let p = extractMousePosition(event);
        let svgPositions = svgPolygons[svgPolygons.length - 1];
        if (mouseIsDown && svgPositions.length > 0) {
            svgPositions[svgPositions.length - 1].x = p.x;
            svgPositions[svgPositions.length - 1].y = p.y;
            let newPolygons = [...svgPolygons];
            newPolygons[newPolygons.length - 1] = svgPositions;
            setSvgPolygons(newPolygons);
        }
        setMousePosition(p);
    }

    const handleMouseUp = (e: any) => {
        setMouseIsDown(false);
        let svgPositions = svgPolygons[svgPolygons.length - 1];
        if (e.metaKey) {
            let newPositions = svgPositions.slice(0, svgPositions.length - 1);
            let newPolygons = [...svgPolygons];
            newPolygons[newPolygons.length - 1] = newPositions;
            setSvgPolygons(newPolygons);
            if (onSvgSelected) {
                onSvgSelected(newPolygons);
            }
        } else {
            if (svgPositions && svgPositions.length > 2 && onSvgSelected) {
                onSvgSelected(svgPolygons);
            }
        }
    }

    const handleMouseEnter = (event: any) => {
        if (event.buttons === 1) {
            setMouseIsDown(true);
        }
    }

    const refresh = (e: MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setSvgPolygons([[]]);
        onSvgSelected && onSvgSelected([[]]);
    }

    const addNew = () => {
        setSvgPolygons([...svgPolygons, []]);
    }

    const removePolygon = () => {
        if (svgPolygons.length > 1) {
            setSvgPolygons(svgPolygons.slice(0, svgPolygons.length - 1));
        } else {
            setSvgPolygons([[]]);
        }
    }

    return (
        <>
            <Button onClick={refresh} title={"Reset Selections"}><FontAwesomeIcon icon={faRefresh} /></Button>
            <Button onClick={removePolygon} title={"Remove Polygon"}><FontAwesomeIcon icon={faRemove} /></Button>
            <Divider type="vertical" />
            <Button onClick={addNew} title={"Start New Polygon"}><FontAwesomeIcon icon={faAdd} /></Button>
            <Divider type="vertical" />
            <div
                style={{ userSelect: "none", padding: "30px", margin: "10px" }}
                draggable={false}
                className="no-select"
                onSelect={() => false}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
                onMouseEnter={handleMouseEnter}
            >
                <canvas
                    style={{ position: "absolute" }}
                    ref={imageCanvas} />
                <img
                    key={imgSrc} // use imgSrc as key so prior image doesn't load
                    ref={imageRef}
                    onDragStart={() => false}
                    draggable={false}
                    onSelect={() => false}
                    src={imgSrc} alt="cropping" />
            </div>
        </>
    );
}

export default PartialCanvasSVGSelector;