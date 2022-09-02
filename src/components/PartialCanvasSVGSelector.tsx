import React, { useEffect, useRef, useState } from 'react';
import { Position } from '../utils/IIIFUtils';

class PartialCanvasSelectorProps {
    imageId?: string;
    maxWidthHeight!: number;
    onSvgSelected?: (polygons: Position[][]) => void;
};

function PartialCanvasSVGSelector({ imageId, maxWidthHeight, onSvgSelected }: PartialCanvasSelectorProps) {

    const [mouseIsDown, setMouseIsDown] = useState<boolean>(false);
    const [mousePosition, setMousePosition] = useState<Position | null>(null);
    const [svgPositions, setSvgPositions] = useState<Position[]>([]);
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
                context.strokeStyle = 'red';
                context.lineWidth = 5;
                context.lineJoin = "round";
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

                    for (let i = 0; i < svgPositions.length; i++) {
                        let pos = svgPositions[i];
                        context.beginPath();
                        context.fillStyle = 'green';
                        context.strokeStyle = 'blue';
                        if (mousePosition) {
                            if (Math.abs(pos.x - mousePosition.x) < m && Math.abs(pos.y - mousePosition.y) < m) {
                                context.fillStyle = 'orange';
                                context.strokeStyle = '#30F';
                            }
                        }
                        context.arc(pos.x, pos.y, 5, 0, 2 * Math.PI, true);
                        context.fill();
                        context.stroke();
                    }
                }
            }
        }
    }, [svgPositions, mousePosition]);

    // clear selection when image changes.
    useEffect(() => {
        setSvgPositions([]);
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
        for (let i = 0; i < svgPositions.length; i++) {
            let pos = svgPositions[i];
            if (Math.abs(pos.x - p.x) < m && Math.abs(pos.y - p.y) < m) {
                console.log("Matching on " + i);
                let newPositions: Position[];
                if (i === 0) {
                    newPositions = svgPositions.slice(1);
                } else if (i + 1 < svgPositions.length) {
                    newPositions = svgPositions.slice(i + 1);
                    newPositions = newPositions.concat(svgPositions.slice(0, i));
                } else {
                    console.log("Breaking out");
                    return;
                }
                newPositions.push(svgPositions[i]);
                setSvgPositions(newPositions);
                return;
            }
        }
        setSvgPositions([...svgPositions, p]);
    }

    const handleMouseMove = (event: any) => {
        let p = extractMousePosition(event);
        if (mouseIsDown && svgPositions.length > 0) {
            svgPositions[svgPositions.length - 1].x = p.x;
            svgPositions[svgPositions.length - 1].y = p.y;
            setSvgPositions([...svgPositions]);
        }
        setMousePosition(p);
    }

    const handleMouseUp = (e: any) => {
        setMouseIsDown(false);
        if (svgPositions && svgPositions.length > 2 && onSvgSelected) {
            onSvgSelected([svgPositions]);
        }
    }

    const handleMouseEnter = (event: any) => {
        if (event.buttons === 1) {
            setMouseIsDown(true);
        }
    }

    return (
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
    );
}

export default PartialCanvasSVGSelector;