

import React, { useContext } from 'react'
import AnimationWrapper from '../common/page-animation'
import toast, { Toaster } from 'react-hot-toast'
import { EditorContext } from '../pages/editor.pages'
import Tag from './tags.component'

const PublishForm = () => {


  const {blog, blog: {banner, title, tags, des} ,setEditorState, setBlog} = useContext(EditorContext)

  const characterLinit = 500
  const tagLimit = 5

  const handleTitleKeyDown = (e) => {
    if (e.keyCode === 13) {
        e.preventDefault()
    }
  }

  const handleKeyDownEvent = (e) => {
    if (e.keyCode == 13 || e.keyCode == 188) {
      e.preventDefault()

      let tag = e.target.value

      if (tags.length < tagLimit) {
        if (!tags.includes(tag) && tag.length) {
          console.log('ok');
          setBlog({...blog, tags: [...tags, tag]})
        }
      } else {
        toast.error(`You can add max ${tagLimit} tags`)
      }
      e.target.value = ''
    }
  }




  return (
    <AnimationWrapper>
      <section className='w-screen min-h-screen grid items-center lg:grid-cols-2 py-16 lg::'>
        <Toaster />

        <button 
        onClick={() => setEditorState("editor")}
        className='w-12 h-12 absolute right-[5vw] z-10 top-[5%] lg:top-[10%]'>
          <i className='fi fi-br-cross'></i>
        </button>

        <div className='max-w-[550px] center'>
          <p className='text-dark-grey mb-1'>Preview</p>

          <div className='w-full aspect-video rounded-lg overflow-hidden bg-grey mt-4'>
            <img src={banner} alt="" />
          </div>

          <h1 className='text-4xl font-medium mt-2 leading-tight line-clamp-2'>{title}</h1>

          <p className='font-gelasio line-clamp-2 text-xl leading-7 mt-4'>{des}</p>


        </div>


        <div className='border-grey mg:border-1 lg:pl-8'>
          <p>Blog Title</p>
          <input type="text" placeholder='blog title' defaultValue={(title)} className='input-box mb-9' />

          <p className='text-dark-grey mb-2 mt-9'>Short description about your blog</p>

          <textarea 
            className='h-40 resize-none leading-7 input-box pl-4'
            maxLength={characterLinit}
            defaultValue={des}
            onKeyDown={handleTitleKeyDown}
            onChange={(e) => setBlog({...blog, des: e.target.value})}

          >

          </textarea>
          <p className='mt-1 text-dark-grey text-sm text-right'>{characterLinit - des.length} characters left</p>


          <p>Topics - (Helps is searching and ranking your blog post)</p>
        </div>


        <div className='relative input-box pl-2 py-2 pb-4'>
          <input type="text" placeholder='Topic'
          className='sticky input-box bg-white top-0 left-0 pl-4 mb-3 focus:bg-white'
          onKeyDown={handleKeyDownEvent}
          />

          {tags?.map((tag, index) => (
            <Tag key={index} tag={tag} />
          ))}
        </div>




      </section>
    </AnimationWrapper>
  )
}

export default PublishForm