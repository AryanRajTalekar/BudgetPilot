import React from 'react'
import { SiWebmoney } from "react-icons/si";
import { IoArrowDownCircleOutline } from "react-icons/io5";



const Navbar = () => {
  return (
    <div className='w-full h-[7vw]  rounded-lg flex items-center justify-between'>
      <div className='logo w-[20vw] h-[7vw] flex items-center text-white gap-4 p-8'>
        <SiWebmoney size={50} />
        <h1 className='text-3xl font-semibold'>BudgetPilot</h1>
      </div>
      <div>

      </div>
      <div className='flex gap-4 p-14'>
        <button className='text-white font-semibold  rounded-xl w-[10vw] h-[4vh]'>Login / Create Account</button>
        <button className=' flex items-center p-4 gap-2 text-white font-semibold border border-2 rounded-xl w-[10vw] h-[4vh] hover:bg-white transition duration-300 hover:text-black'>Get BudgetPilot <IoArrowDownCircleOutline size={25}/>
</button>
      </div>
    </div>
  )
}

export default Navbar 