// contexts/DragDropContext.jsx - ПРОСТАЯ ВЕРСИЯ
import React, { createContext, useContext, useState } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';

const DragDropContext = createContext();

export const useDragDrop = () => useContext(DragDropContext);

export const DragDropProvider = ({ children }) => {
  const [sectionsOrder, setSectionsOrder] = useState([]);

  const moveSection = (fromIndex, toIndex) => {
    const newOrder = [...sectionsOrder];
    const [moved] = newOrder.splice(fromIndex, 1);
    newOrder.splice(toIndex, 0, moved);
    setSectionsOrder(newOrder);
    return newOrder;
  };

  const updateSectionsOrder = (sections) => {
    setSectionsOrder(sections);
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <DragDropContext.Provider value={{ sectionsOrder, moveSection, updateSectionsOrder }}>
        {children}
      </DragDropContext.Provider>
    </DndProvider>
  );
};