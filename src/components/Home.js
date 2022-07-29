import React, {useEffect, useState} from 'react';

const { HANDLE_SAVE_DATA, HANDLE_FETCH_DATA } = require("../utils/constants")

export const Home = () => {
    const [val, setVal] = useState("");
    const [itemsToTrack, setItems] = useState([]);

    const addItem = (item) => {
        console.log("react triggered addItem with", item)
        window.electronAPI.saveData(item)
        setVal('')
    };

    const handleNewItem = (event, data) => {
        console.log("renderer received new item")
        setItems([...itemsToTrack, data.message])
    }

    const handleChange = e => {
        setVal(e.target.value)
    }

    const handleSubmit = e => {
        e.preventDefault()
        addItem(val)
    }

    return(
        <div>
            <h1>State Persistence Test</h1>
            <input type={"text"} onChange={handleChange} value={val} />
            <button type={'submit'} onClick={handleSubmit}>Add Item</button>
        </div>
    )
}

export default Home;