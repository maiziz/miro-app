import React, { useState, useCallback } from 'react';
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch';
import { Grid } from './Grid';
import { BoardSection } from './BoardSection';
import { useBoardStore } from '../../store/boardStore';
import { Plus, ZoomIn, ZoomOut, Maximize } from 'lucide-react';

export const Canvas: React.FC = () => {
  const [scale, setScale] = useState(1);
  const sections = useBoardStore((state) => state.sections);
  const addSection = useBoardStore((state) => state.addSection);
  
  const handleAddSection = useCallback(() => {
    addSection({
      id: crypto.randomUUID(),
      title: 'New Section',
      type: 'ideas',
      position: { x: 100, y: 100 },
      items: []
    });
  }, [addSection]);

  const renderControls = useCallback(({ zoomIn, zoomOut, resetTransform }) => (
    <>
      <div className="fixed top-4 right-4 z-50 flex gap-2">
        <button
          onClick={handleAddSection}
          className="bg-white hover:bg-gray-50 text-gray-700 px-4 py-2 rounded-lg shadow-sm 
                   flex items-center gap-2 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Section
        </button>
      </div>
      
      <div className="fixed bottom-4 right-4 z-50 flex gap-2">
        <button
          onClick={() => zoomIn(0.2)}
          className="bg-white hover:bg-gray-50 text-gray-700 p-2 rounded-lg shadow-sm"
        >
          <ZoomIn className="w-5 h-5" />
        </button>
        <button
          onClick={() => zoomOut(0.2)}
          className="bg-white hover:bg-gray-50 text-gray-700 p-2 rounded-lg shadow-sm"
        >
          <ZoomOut className="w-5 h-5" />
        </button>
        <button
          onClick={() => resetTransform()}
          className="bg-white hover:bg-gray-50 text-gray-700 p-2 rounded-lg shadow-sm"
        >
          <Maximize className="w-5 h-5" />
        </button>
      </div>
    </>
  ), [handleAddSection]);
  
  return (
    <div className="w-full h-screen overflow-hidden bg-gray-50">
      <TransformWrapper
        initialScale={1}
        minScale={0.1}
        maxScale={3}
        limitToBounds={false}
        centerOnInit={true}
        onZoom={({ state }) => setScale(state.scale)}
        smooth={true}
        wheel={{ smoothStep: 0.05 }}
        pinch={{ disabled: false }}
        doubleClick={{ disabled: true }}
      >
        {(utils) => (
          <>
            {renderControls(utils)}
            <TransformComponent
              wrapperStyle={{
                width: '100%',
                height: '100%',
                overflow: 'hidden'
              }}
            >
              <div className="w-[10000px] h-[10000px] relative">
                <Grid scale={scale} />
                <div className="absolute inset-0 p-8">
                  {sections.map((section) => (
                    <BoardSection
                      key={section.id}
                      section={section}
                    />
                  ))}
                </div>
              </div>
            </TransformComponent>
          </>
        )}
      </TransformWrapper>
    </div>
  );
};