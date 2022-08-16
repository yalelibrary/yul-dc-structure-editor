import { Divider, Input, Modal } from 'antd';
import React, { useState } from 'react';

class LaunchModalProps {
    isModalVisible!: boolean;
    setIsModalVisible!: ((value: boolean) => void);
    setApiKeyAndManifest?: ((apiKey: string, manifestUrl: string) => void);
}

function LaunchModal({ isModalVisible, setIsModalVisible, setApiKeyAndManifest }: LaunchModalProps) {

    let [apiKey, setApiKey] = useState("");
    let [manifestUrl, setManifestUrl] = useState("");

    const handleOk = () => {
        setApiKeyAndManifest && setApiKeyAndManifest(apiKey, manifestUrl);
        setIsModalVisible(false);
    };

    const handleCancel = () => {
        setIsModalVisible(false);
    };

    return (
        <>
            <Modal title="Enter the API Key and URL the for Manifest" visible={isModalVisible} onOk={handleOk} onCancel={handleCancel}>
                <Input placeholder="API Key" value={apiKey} onChange={(e) => setApiKey(e.target.value)} />
                <Divider />
                <Input placeholder="Manifest" value={manifestUrl} onChange={(e) => setManifestUrl(e.target.value)} onDoubleClick={()=>setManifestUrl('https://iiif.io/api/cookbook/recipe/0024-book-4-toc/manifest.json')}/>
            </Modal>
        </>
    );
}

export default LaunchModal;