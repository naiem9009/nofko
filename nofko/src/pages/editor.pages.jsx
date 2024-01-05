

import React, { createContext, useContext, useState } from 'react'
import { UserContext } from '../App'
import { Navigate } from 'react-router-dom'
import PublishForm from '../components/publish-form.component'
import BlogEditor from '../components/blog-editor.component'


export const EditorContext = createContext({})

const blogStracture = {
  title: "",
  banner: "",
  content: [],
  tags: [],
  des: "",
  author: {personal_info : {}}

}

const Editor = () => {



  const [blog, setBlog] = useState(blogStracture)





    const {userAuth: {access_token}} = useContext(UserContext)
    const [editorState, setEditorState] = useState('editor')
    const [textEditor, setTextEditor] = useState({isReady: false})




  return (
    <EditorContext.Provider value={{blog, setBlog, editorState, setEditorState, textEditor, setTextEditor}}>
      { !access_token ? <Navigate to='/signin' /> : editorState === 'editor' ? 
      <BlogEditor />
      :
      <PublishForm /> }
    </EditorContext.Provider>
  )
}

export default Editor