import React, { useEffect, useRef } from 'react';
import OpenSeaDragon from "openseadragon";

class OpenSeadragonViewerProps {
    imageUrl!: string;
}

function OpenSeadragonViewer({ imageUrl }: OpenSeadragonViewerProps) {
    const viewerRef = useRef<OpenSeaDragon.Viewer | null>(null);
    const viewerDivRef = useRef<HTMLDivElement | null>(null);
    useEffect(() => {
        if (!viewerDivRef.current) return;
        viewerRef.current && viewerRef.current.destroy();
        try {
            viewerRef.current =
                OpenSeaDragon({
                    element: viewerDivRef.current!,
                    tileSources: [imageUrl],
                    prefixUrl: '//openseadragon.github.io/openseadragon/images/',
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
        }
        catch (e) {
            viewerRef.current = null;
        }
        return () => {
            viewerRef.current && viewerRef.current.destroy();
            viewerRef.current = null;
        };
    }, [imageUrl]);

    return (
        <div
            ref={viewerDivRef}
            style={{
                height: "calc(100vh - 280px)",
                width: "100%"
            }}
        >
        </div>
    );
};

export default OpenSeadragonViewer;