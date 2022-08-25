import React, { useEffect, useRef, useState } from 'react';
import { Rectangle } from '../utils/IIIFUtils';

class PartialImageIconProps {
    imageId!: string;
    rectangle?: Rectangle;
    ratio!: number;
};

function PartialImageIcon({ imageId, rectangle, ratio }: PartialImageIconProps) {

    let imageRef = useRef<HTMLImageElement>(null);
    let imageCanvas = useRef<HTMLCanvasElement>(null);

    const handleImageLoaded = () => {
        if (imageCanvas.current && imageRef.current && rectangle) {
            imageCanvas.current.style.width = imageRef.current.offsetWidth + "px";
            imageCanvas.current.style.height = imageRef.current.offsetHeight + "px";
            imageCanvas.current.width = imageRef.current.offsetWidth;
            imageCanvas.current.height = imageRef.current.offsetHeight;
            imageCanvas.current.style.top = imageRef.current.offsetTop + "px";
            imageCanvas.current.style.left = imageRef.current.offsetLeft + "px";
            const context = imageCanvas.current.getContext('2d');
            if (context) {
                context.strokeStyle = 'red';
                context.lineWidth = 2;
                let x = rectangle.x * ratio;
                let y = rectangle.y * ratio;
                let w = rectangle.w * ratio;
                let h = rectangle.h * ratio;
                context.beginPath();
                context.shadowBlur = 5;
                context.shadowOffsetX = 2;
                context.shadowOffsetY = 2;
                context.shadowColor = 'rgba(0, 0, 0, .8)';
                context.moveTo(x, y);
                context.lineTo(x + w, y);
                context.lineTo(x + w, y + h);
                context.lineTo(x, y + h);
                context.setLineDash([1, 1]);
                context.closePath();
                context.stroke();
            }
        }
    };
    let imageIdComponents = imageId.split("/");
    imageIdComponents[imageIdComponents.length - 3] = "!20,20";
    let imageSrc = imageIdComponents.join("/");

    return <><canvas style={{ position: "absolute" }} ref={imageCanvas} /><img src={imageSrc} alt="Partial Canvas" ref={imageRef} onLoad={handleImageLoaded} /></>
}

export default PartialImageIcon;