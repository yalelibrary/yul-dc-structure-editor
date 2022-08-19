import React, { useRef, useState } from 'react';

class PartialCanvasSelectorProps {
    imageId?: string;
    onRectangleSelected?: (x: number, y: number, w: number, h: number) => null;
};



function PartialCanvasSelector({ imageId, onRectangleSelected }: PartialCanvasSelectorProps) {

    let imageRef = useRef<HTMLImageElement>(null);

    if (!imageId) return <>No Image Selected</>   
    let imageIdComponents = imageId.split("/");
    imageIdComponents[imageIdComponents.length - 3] = "!500,500";
    let imgSrc = imageIdComponents.join("/");

    const handleMouseDown = (e: any) => {          
        var rect = imageRef.current!.getBoundingClientRect();
        var x = e.clientX - rect.left; //x position within the element.
        var y = e.clientY - rect.top;  //y position within the element.
        console.log("DOWN: " + x + ", " + y );

    }

    const handleMouseMove = (event: any) => {
    }

    const handleMouseUp = (e: any) => {   
        var rect = imageRef.current!.getBoundingClientRect();
        var x = e.clientX - rect.left; //x position within the element.
        var y = e.clientY - rect.top;  //y position within the element.
        console.log("UP: " + x + ", " + y );    
    }

    const handleMouseLeave = (e: any) => { 
        var rect = imageRef.current!.getBoundingClientRect();
        var x = e.clientX - rect.left; //x position within the element.
        var y = e.clientY - rect.top;  //y position within the element.
        console.log("UP: " + x + ", " + y );
    }

    const handleMouseEnter = (event: any) => {
        console.log(event.buttons);
    }

    return (
        <div 
            style={{userSelect: "none", padding: "20px"}}
            draggable={false}
            onSelect={()=>false}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onMouseEnter={handleMouseEnter}
        
        >
            <img                 
                ref={imageRef}
                onDragStart={()=>false}
                draggable={false}
                onSelect={()=>false}
            
                src={imgSrc} alt="cropping image" />
        </div>
    );
}

export default PartialCanvasSelector;