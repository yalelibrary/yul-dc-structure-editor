import React, { useRef } from 'react';
import { Rectangle } from '../utils/IIIFUtils';

class PartialImageIconProps {
    imageId!: string;
    rectangle?: Rectangle;
    svg?: string;
    ratio!: number;
};

function PartialImageIcon({ imageId, rectangle, svg, ratio }: PartialImageIconProps) {

    let imageRef = useRef<HTMLImageElement>(null);
    let imageCanvas = useRef<HTMLCanvasElement>(null);

    const handleImageLoaded = () => {
        if (imageCanvas.current && imageRef.current && (rectangle || svg)) {
            imageCanvas.current.style.width = imageRef.current.offsetWidth + "px";
            imageCanvas.current.style.height = imageRef.current.offsetHeight + "px";
            imageCanvas.current.width = imageRef.current.offsetWidth;
            imageCanvas.current.height = imageRef.current.offsetHeight;
            imageCanvas.current.style.top = imageRef.current.offsetTop + "px";
            imageCanvas.current.style.left = imageRef.current.offsetLeft + "px";
            const context = imageCanvas.current.getContext('2d');
            if (context) {
                context.strokeStyle = '#c00';
                context.lineWidth = 2;
                context.beginPath();
                context.shadowBlur = 5;
                context.shadowOffsetX = 2;
                context.shadowOffsetY = 2;
                context.shadowColor = 'rgba(0, 0, 0, .8)';
                if (rectangle) {
                    let x = rectangle.x * ratio;
                    let y = rectangle.y * ratio;
                    let w = rectangle.w * ratio;
                    let h = rectangle.h * ratio;
                    context.moveTo(x, y);
                    context.lineTo(x + w, y);
                    context.lineTo(x + w, y + h);
                    context.lineTo(x, y + h);
                    context.setLineDash([3, 1]);
                    context.closePath();
                    context.stroke();
                } else if (svg) {
                    // draw the svg on the context with some kind of adjustment:
                    let svgParts = svg.split(" ");
                    for (let i = 0; i < svgParts.length; i++) {
                        let part = svgParts[i].trim();
                        if (part) {
                            if ("ML".includes(part)) {
                                let x = parseFloat(svgParts[++i]) * ratio;
                                let y = parseFloat(svgParts[++i]) * ratio;
                                if (part === "M") {
                                    if (i > 0) {
                                        context.closePath();
                                        context.stroke();
                                        context.beginPath();
                                    }
                                    context.moveTo(x, y);
                                } else if (part === "L") {
                                    context.lineTo(x, y);
                                }
                            }
                        }
                    }
                    context.closePath();
                    context.stroke();
                }
            }
        }
    };
    let imageIdComponents = imageId.split("/");
    imageIdComponents[imageIdComponents.length - 3] = "!20,20";
    let imageSrc = imageIdComponents.join("/");

    return <><canvas style={{ position: "absolute" }} ref={imageCanvas} /><img src={imageSrc} alt="Partial Canvas" ref={imageRef} onLoad={handleImageLoaded} /></>
}

export default PartialImageIcon;