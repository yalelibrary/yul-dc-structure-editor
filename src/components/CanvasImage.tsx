import React, { useRef, useState } from 'react';
import { ManifestCanvasInfo } from '../utils/IIIFUtils';
import { useInView } from "react-intersection-observer";

class CanvasImageProps {
    selected: boolean = false;
    info!: ManifestCanvasInfo;
    maxWidthHeight: number = 200;
    onClick?: (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => void;
    onDoubleClick?: (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => void;
}

function CanvasImage({ selected, info, maxWidthHeight, onClick, onDoubleClick }: CanvasImageProps) {
    const [loaded, setLoaded] = useState(false);
    const { ref, inView } = useInView({
        threshold: 0,
    });
    let imageRef = useRef<HTMLImageElement>(null);
    let divRef = useRef<HTMLDivElement>(null);
    const handleImageLoaded = () => {
        if (imageRef.current && divRef.current) {
            divRef.current.style.maxWidth = `${imageRef.current.offsetWidth + 10}px`
            setLoaded(true);
        }
    }
    return <>
        <div ref={divRef} className={'item' + (selected ? " selected" : "")} >
            <div key={info.imageId} onClick={onClick} ref={ref} onDoubleClick={onDoubleClick} >
                {(inView || loaded) && <img src={info.thumbnail.replace("/!200,200/", `/!${maxWidthHeight},${maxWidthHeight}/`)} loading="lazy" alt={info.label + " " + info.oid} onLoad={handleImageLoaded} ref={imageRef} />}
                <br />
                <div className='item-info'>
                    <span className='item-index'>{(info.index + 1) + ": "}</span>
                    <span className='item-label'>{info.label}</span>
                </div>
            </div >
        </div></>

}

export default CanvasImage;