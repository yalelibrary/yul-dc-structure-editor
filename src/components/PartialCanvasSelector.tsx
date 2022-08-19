import React, { useEffect, useRef, useState } from 'react';
import { Rectangle } from '../utils/IIIFUtils';

class PartialCanvasSelectorProps {
    imageId?: string;
    onRectangleSelected?: (rect: Rectangle) => void;
};

type Position = {
    x: number;
    y: number;
}

function PartialCanvasSelector({ imageId, onRectangleSelected }: PartialCanvasSelectorProps) {

    const [boxStart, setBoxStart] = useState<Position | null>(null);
    const [boxEnd, setBoxEnd] = useState<Position | null>(null);
    const [boxRect, setBoxRect] = useState<Rectangle | null>(null);
    const [mouseIsDown, setMouseIsDown] = useState<boolean>(false);
    let imageRef = useRef<HTMLImageElement>(null);
    let imageCanvas = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        if (imageCanvas.current && imageRef.current) {
            imageCanvas.current.style.width = imageRef.current.offsetWidth + "px";
            imageCanvas.current.style.height = imageRef.current.offsetHeight + "px";
            imageCanvas.current.width = imageRef.current.offsetWidth;
            imageCanvas.current.height = imageRef.current.offsetHeight;
            imageCanvas.current.style.top = imageRef.current.offsetTop + "px";
            imageCanvas.current.style.left = imageRef.current.offsetLeft + "px";
        }
        if (boxStart && boxEnd) {
            let x = Math.min(boxStart.x, boxEnd.x);
            let y = Math.min(boxStart.y, boxEnd.y);
            let w = Math.abs(boxStart.x - boxEnd.x);
            let h = Math.abs(boxStart.y - boxEnd.y);
            let p = { x, y, w, h };
            setBoxRect(p);
            if (imageCanvas.current) {
                const context = imageCanvas.current.getContext('2d');
                if (context) {
                    context.strokeStyle = 'red';
                    context.lineJoin = 'round';
                    context.lineWidth = 5;

                    context.beginPath();
                    context.moveTo(x, y);
                    context.lineTo(x + w, y);
                    context.lineTo(x + w, y + h);
                    context.lineTo(x, y + h);
                    context.setLineDash([10, 5]);
                    context.closePath();

                    context.stroke();
                }
            }
        }
    }, [boxStart, boxEnd]);

    useEffect(() => {
        setBoxRect(null);
        setBoxStart(null);
        setBoxEnd(null);
    }, [imageId]);


    if (!imageId) return <>No Image Selected</>
    let imageIdComponents = imageId.split("/");
    imageIdComponents[imageIdComponents.length - 3] = "!500,500";
    let imgSrc = imageIdComponents.join("/");

    const extractMousePosition = (event: any): Position => {
        let rect = imageRef.current!.getBoundingClientRect();
        let x = Math.min(Math.max(event.clientX - rect.left, 0), imageRef.current!.offsetWidth);
        let y = Math.min(Math.max(event.clientY - rect.top, 0), imageRef.current!.offsetHeight);
        return { x, y }
    }

    const handleMouseDown = (event: any) => {
        let p = extractMousePosition(event);
        setBoxStart(p);
        setBoxEnd(p);
        setMouseIsDown(true);
    }

    const handleMouseMove = (event: any) => {
        if (mouseIsDown) {
            let p = extractMousePosition(event);
            if (!boxStart) {
                setBoxStart(p);
            }
            setBoxEnd(p);
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
            style={{ userSelect: "none", padding: "10px" }}
            draggable={false}
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
                key={imgSrc}
                ref={imageRef}
                onDragStart={() => false}
                draggable={false}
                onSelect={() => false}
                src={imgSrc} alt="cropping image" />
        </div>
    );
}

export default PartialCanvasSelector;