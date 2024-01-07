

import React, { useContext, useEffect, useState } from 'react'
import AnimateWrapper from "../common/page-animation"
import InPageNavigation from '../components/inpage-navigation.component'
import axios from "axios"
import { UserContext } from '../App'
import Loader from '../components/loader.component'
import BlogPostCard from '../components/blog-post.component'
import MinimalBlogPost from '../components/nobanner-blog-post.component'



const HomePage = () => {

  const [blogs, setBlogs] = useState(null)
  const [trendingBlogs, setTrendingBlogs] = useState(null)

  const fetchLatestBlogs = () => {
    axios.get(`${import.meta.env.VITE_SERVER_DOMAIN}/latest-blogs`).then(({data}) => {
      if (data?.blogs) setBlogs(data?.blogs)
    })
  }


  const fetchTrendingBlogs = () => {
    axios.get(`${import.meta.env.VITE_SERVER_DOMAIN}/latest-blogs`).then(({data}) => {
      if (data?.blogs) setTrendingBlogs(data?.blogs)
    })
  }


  const {userAuth: {access_token}} = useContext(UserContext)

  useEffect(() => {
    fetchLatestBlogs()
    fetchTrendingBlogs()
  }, [])



  return (
    <AnimateWrapper>
        <section className='h-cover flex justify-center gap-10'>
            {/* latest blog */}
            <div className='w-full'>
                <InPageNavigation
                routes={['home', 'trending blogs']}
                defaultHidden={['trending blogs']}
                >

                    {/* Latest Blogs */}
                    <>
                      {
                        blogs === null ? <Loader />
                        :
                        blogs?.map((blog, index) => (
                          <AnimateWrapper key={index} transition={{duration: 1, delay: index *.1}}>
                            <BlogPostCard content={blog} author={blog.author.personal_info} />
                          </AnimateWrapper>
                        ))
                      }
                    </>


                    {/* Trending Blogs */}
                    <>
                      {
                        trendingBlogs === null ? <Loader />
                        :
                        trendingBlogs?.map((blog, index) => (
                          <AnimateWrapper key={index} transition={{duration: 1, delay: index *.1}}>
                            <MinimalBlogPost blog={blog} index={index} />
                          </AnimateWrapper>
                        ))
                      }
                    </>


                </InPageNavigation>
            </div>

            
            

        </section>
    </AnimateWrapper>
  )
}

export default HomePage