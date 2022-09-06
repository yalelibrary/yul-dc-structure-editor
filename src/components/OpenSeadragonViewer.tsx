import React, { useEffect, useLayoutEffect, useRef } from 'react';
import OpenSeaDragon from "openseadragon";

class OpenSeadragonViewerProps {
    imageUrl!: string;
    elementId?: string;
}

function OpenSeadragonViewer({ imageUrl, elementId }: OpenSeadragonViewerProps) {
    const viewerRef = useRef<OpenSeaDragon.Viewer | null>(null);

    if (!elementId) {
        elementId = "OpenSeadragon" + Math.round(Math.random() * 100000);
    }

    const initializeViewer = () => {
        viewerRef.current && viewerRef.current.destroy();
        try {
            viewerRef.current =
                OpenSeaDragon({
                    id: elementId,
                    tileSources: [imageUrl],
                    prefixUrl: 'https://cdn.jsdelivr.net/gh/Benomrans/openseadragon-icons@main/images/',
                    animationTime: 0.5,
                    autoHideControls: false,
                    blendTime: 0.1,
                    showNavigationControl: true,
                    showRotationControl: true,
                    showFlipControl: true,
                    maxZoomPixelRatio: 2,
                    visibilityRatio: 1,
                    zoomPerScroll: 2,
                    preload: true
                });
            viewerRef.current.setControlsEnabled(true);
        }
        catch (e) {
            viewerRef.current = null;
            console.error(e);
        }
    };

    useEffect(() => {
        if (imageUrl && viewerRef.current) {
            viewerRef.current.open(imageUrl);
        }
    }, [imageUrl]);

    useLayoutEffect(() => {
        setTimeout(initializeViewer, 100);
        return () => {
            viewerRef.current && viewerRef.current.destroy();
            viewerRef.current = null;
        };
    }, []);

    return (
        <div
            id={elementId}
            style={{
                height: "calc(100vh - 280px)",
                width: "100%"
            }}
        >
        </div>
    );
};

export default OpenSeadragonViewer;