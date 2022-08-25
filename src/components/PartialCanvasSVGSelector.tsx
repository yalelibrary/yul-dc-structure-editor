import React, { useEffect, useRef, useState } from 'react';
import { Rectangle } from '../utils/IIIFUtils';

class PartialCanvasSelectorProps {
    imageId?: string;
    maxWidthHeight!: number;
    onRectangleSelected?: (rect: Rectangle) => void;
    onSvgSelected?: (points: Position[]) => void;
};

type Position = {
    x: number;
    y: number;
}

function PartialCanvasSVGSelector({ imageId, maxWidthHeight, onRectangleSelected }: PartialCanvasSelectorProps) {

    const [boxStart, setBoxStart] = useState<Position | null>(null);
    const [boxEnd, setBoxEnd] = useState<Position | null>(null);
    const [boxRect, setBoxRect] = useState<Rectangle | null>(null);
    const [mouseIsDown, setMouseIsDown] = useState<boolean>(false);
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
                if (svgPositions.length > 0) {
                    context.beginPath();
                    context.moveTo(svgPositions[0].x, svgPositions[0].y);
                    for (let i = 1; i < svgPositions.length; i++) {
                        context.lineTo(svgPositions[i].x, svgPositions[i].y);
                    }
                    context.closePath();
                    context.stroke();
                }

            }
        }
    }, [svgPositions]);

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
        for (let i = 0; i < svgPositions.length - 1; i++) {
            let pos = svgPositions[i];
            if (Math.abs(pos.x - p.x) < m && Math.abs(pos.x - p.x) < m) {
                // close enough
                let newPositions: Position[];
                if (i === 0) {
                    newPositions = svgPositions.slice(1);
                } else if (i + 1 < svgPositions.length) {
                    newPositions = svgPositions.slice(i + 1);
                } else {
                    newPositions = [];
                }
                if (i > 0) {
                    newPositions = newPositions.concat(svgPositions.slice(0, i));
                }
                newPositions.push(svgPositions[i]);
                setSvgPositions(newPositions);
                return;
            }
        }
        setSvgPositions([...svgPositions, p]);
    }

    const handleMouseMove = (event: any) => {
        if (mouseIsDown && svgPositions.length > 0) {
            let p = extractMousePosition(event);
            svgPositions[svgPositions.length - 1].x = p.x;
            svgPositions[svgPositions.length - 1].y = p.y;
            setSvgPositions([...svgPositions]);
        }
    }

    const handleMouseUp = (e: any) => {
        setMouseIsDown(false);
        if (boxRect && onRectangleSelected) {
            onRectangleSelected(boxRect);
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
                src={imgSrc} alt="cropping image" />
        </div>
    );
}

export default PartialCanvasSVGSelector;