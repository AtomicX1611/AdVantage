import React from 'react'
import { createContext } from 'react'
import { useState } from 'react';

export const CurrentUserContext = createContext();

function CurrentUserContextProvider({children}) {
    const [currentUser2, setCurrentUser2] = useState();   
  return (
    <CurrentUserContext.Provider value={{ currentUser2, setCurrentUser2 }}>
      {children}
    </CurrentUserContext.Provider>
  )
}

export default CurrentUserContextProvider
