

import React, { useContext, useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import logo from "../imgs/nofko-logo.png"
import AnimationWrapper from '../common/page-animation'
import defaultBanner from "../imgs/blog-banner.png"
import { uploadImage } from '../common/server-upload'
import {Toaster, toast} from "react-hot-toast"
import { EditorContext } from '../pages/editor.pages'
import Editorjs from "@editorjs/editorjs"
import { tools } from './tools.component'
import axios from 'axios'
import { UserContext } from '../App'

const BlogEditor = () => {

    const {blog, blog:  {title, banner, content, tags, des}, setBlog, textEditor, setTextEditor, setEditorState} = useContext(EditorContext)
    const {userAuth: {access_token}} = useContext(UserContext)


    const navigate = useNavigate()

    // useEffect
    useEffect(() => {
        if (!textEditor.isReady) {
        setTextEditor(new Editorjs({
            holderId: "textEditor",
            data: content,
            tools: tools,
            placeholder: "Let's Write an awesome story"
        }))}
    }, [])






    const handleBannerUpload = async (ev) => {
        
        const img = ev.target.files[0]

        const formData = new FormData()
        formData.append('upload_image', img)

        if (img) {
            let loadingUpload = toast.loading('Uploading...')
            await uploadImage(formData).then(img_url => {
                if (img_url) {
                    toast.dismiss(loadingUpload)
                    toast.success('Uploaded 🥰')

                    setBlog({...blog, banner: img_url})
                }
            }).catch(err => {
                toast.dismiss(loadingUpload)
                console.log(err);
            })
        }
        
    }



    const handleTitleKeyDown = (e) => {
        if (e.keyCode === 13) {
            e.preventDefault()
        }
    }

    const handleTitleChange = (e) => {
        let input = e.target
        input.style.height = 'auto'
        input.style.height = input.scrollHeight + 'px'


        setBlog({...blog, title: input.value})


    }



    const handlePublishEvent = () => {
        if (!banner) {
            return toast.error("Upload a blog banner to puplish it")
        }

        if (!title) {
            return toast.error("Write blog title to publish it")
        }

        if (textEditor.isReady) {
            textEditor.save().then(data => {
                if (data.blocks.length) {
                    setBlog({...blog, content: data})
                    setEditorState("publish")
                } else {
                    return toast.error("Write Something in your blog to publish it")
                }
            })
        }
    }


    const handleSaveDraft = (e) => {
        if (e.target.className.includes('disable')) return;
        if (!title.length) return toast.error(`Writing blog title before saving it as a draft`)

        // if (!des.length || des.length > characterLimit) return toast.error(`Write a description about your blog withing ${characterLimit} characters to publish`)



        const loadingToast = toast.loading("Saving Draft...")
        // e.target.classList.add('disable')
    

        if (textEditor.isReady) {
            textEditor.save().then(content => {
                const blogObj = {
                    title,
                    banner,
                    des,
                    content,
                    draft: true,
                    tags
                  }
              
                  axios.post(`${import.meta.env.VITE_SERVER_DOMAIN}/create-blog`, blogObj, {
                    headers: {
                      'Authorization': `Bearer ${access_token}`
                    }
                  }).then(() => {
                    // e.target.classList.add('disable')
                    toast.dismiss(loadingToast)
                    toast.success("Saved 😍")
              
                    setTimeout(() => {
                      navigate('/')
                    }, 500)
                  }).catch(({response}) => {
                    e.target.classList.add('disable')
                    toast.dismiss(loadingToast)
              
                    return toast.error(response?.data?.error)
                  })
            })
        }

    }


    






  return (
    <>
        <nav className='navbar'>
            <Link to='/' className='flex-none w-10'>
                <img src={logo} />

            </Link>

            <p className='max-md:hidden text-black line-clamp-1 w-full'>
                {title ? title : "New Blog"}
            </p>

            <div className='flex gap-4 ml-auto'>
                <button className='btn-dark py-2'
                onClick={handlePublishEvent}
                >Publish</button>
                <button 
                onClick={handleSaveDraft}
                className='btn-dark py-2'
                >Dave Draft</button>
            </div>

        </nav>

        <Toaster />

        <AnimationWrapper>
            <section>
                <div className='mx-auto max-w-[900px] w-full'>
                    <div className='relative aspect-video bg-white border-4 border-grey hover:opacity-80'>
                        <label>
                            <img
                            src={banner ? banner : defaultBanner}
                            className='z-20'
                            
                            />

                            <input type="file"
                            id='uploadBanner'
                            accept='png, jpg, jpeg'
                            hidden
                            onChange={handleBannerUpload}
                            />
                        </label>
                    </div>


                    <textarea
                    defaultValue={title}
                    placeholder='Blog title'
                    className='text-4xl font-medium w-full outline-none resize-none h-20 mt-10 leading-tight placeholder:opacity-40'
                    onKeyDown={handleTitleKeyDown}
                    onChange={handleTitleChange}
                    >

                    </textarea>

                    <hr className='w-full opacity-10 my-5' />

                    <div id='textEditor' className='font-gelasio'></div>




                </div>
            </section>
        </AnimationWrapper>
    </>
  )
}

export default BlogEditor