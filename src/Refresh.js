import React from 'react'
import { IoRefresh } from "react-icons/io5";

export default function Refresh({ fontCol, connectWallet, loading }) {
    return (
        <span className={`${fontCol} text-xl cursor-pointer w-fit h-fit bg-black`} onClick={() => { connectWallet() }}><IoRefresh className={`${loading ? "animateRotate" : ""}`} /></span>
    )
}
