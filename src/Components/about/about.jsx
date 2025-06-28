/* eslint-disable no-unused-vars */
import React from 'react'
import style from './About.module.css'
import logo from '../../assets/Alreedy.png'
import { useNavigate } from 'react-router-dom'
export default function About() {
  const navigate = useNavigate()
  return (
    <>
    <img onClick={()=>{
      navigate('/')
    }} src={logo} alt="logo" className='w-1/3 sm:w-1/4 mx-auto mt-[11em] mb-10 sm:mt-40 animate-pulse cursor-pointer' />
    <p className='text-center text-gray-500 font-alexandria font-light text-lg mb-[8em] animate-pulse'>صيدليات الريدي في السويس: صيدلية أونلاين لطلب الأدوية ومنتجات العناية بالصحة والجمال مع توصيل سريع لكل مناطق السويس. اكتشف عروض الصيف والخصومات</p>

    </>
  )
}
