

import React, { useContext } from 'react'
import AnimationWrapper from '../common/page-animation'
import toast, { Toaster } from 'react-hot-toast'
import { EditorContext } from '../pages/editor.pages'
import Tag from './tags.component'
import axios from 'axios'
import { UserContext } from '../App'
import { useNavigate } from 'react-router-dom'

const PublishForm = () => {

  const {userAuth: {access_token}} = useContext(UserContext)
  const navigate = useNavigate()


  const {blog, blog: {banner, title, tags, des, content } ,setEditorState, setBlog} = useContext(EditorContext)

  const characterLimit = 500
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

  const publishBlog = (e) => {

    if (e.target.className.includes('disable')) return;
    if (!title.length) return toast.error(`Writing blog title before publishing`)

    if (!des.length || des.length > characterLimit) return toast.error(`Write a description about your blog withing ${characterLimit} characters to publish`)

    if (!tags.length) return toast.error("Enter at least 1 tag to help us rank your blog")


    const loadingToast = toast.loading("Publishing...")
    e.target.classList.add('disable')

    const blogObj = {
      title,
      banner,
      des,
      content,
      draft: false,
      tags
    }

    axios.post(`${import.meta.env.VITE_SERVER_DOMAIN}/create-blog`, blogObj, {
      headers: {
        'Authorization': `Bearer ${access_token}`
      }
    }).then(() => {
      e.target.classList.add('disable')
      toast.dismiss(loadingToast)
      toast.success("Published 😍")

      setTimeout(() => {
        navigate('/')
      }, 500)
    }).catch(({response}) => {
      e.target.classList.add('disable')
      toast.dismiss(loadingToast)

      return toast.error(response?.data?.error)
    })
    
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
          <input type="text" placeholder='blog title' defaultValue={(title)} className='input-box mb-9' onChange={(e) => setBlog({...blog, title: e.target.value})} />

          <p className='text-dark-grey mb-2 mt-9'>Short description about your blog</p>

          <textarea 
            className='h-40 resize-none leading-7 input-box pl-4'
            maxLength={characterLimit}
            defaultValue={des}
            onKeyDown={handleTitleKeyDown}
            onChange={(e) => setBlog({...blog, des: e.target.value})}

          >

          </textarea>
          <p className='mt-1 text-dark-grey text-sm text-right'>{characterLimit - des.length} characters left</p>


          <p>Topics - (Helps is searching and ranking your blog post)</p>
        </div>


        <div>
        <div className='relative input-box pl-2 py-2 pb-4'>
          <input type="text" placeholder='Topic'
          className='sticky input-box bg-white top-0 left-0 pl-4 mb-3 focus:bg-white'
          onKeyDown={handleKeyDownEvent}
          />

          {tags?.map((tag, index) => (
            <Tag key={index} tagIndex={index} tag={tag} />
          ))}

        </div>

        <p className='mt-1 mb-4 text-dark-grey text-right'>{tagLimit - tags.length} tags left</p>

        <button 
        onClick={publishBlog}
        className='btn-dark px-8'
        
        >Publish</button>

        </div>






      </section>
    </AnimationWrapper>
  )
}

export default PublishForm