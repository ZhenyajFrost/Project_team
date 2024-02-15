import React, {useState} from 'react'
import Input from "../components/UI/Input/Input"

export default function CreateLot() {
    const[lot, setLot]=useState({title:"", description:"", endOn:new Date(), minimalBid:0, sellOn:Infinity, mainImage:"", images:[]})
    const onInput = (e)=>{
        const {name, value} = e.target;
        setLot({...lot, [name]:value})
    }
    const onSubmit = (e)=>{
        e.preventDefault();
        console.log(lot);
        setLot({title:"", description:"", endOn:new Date(), minimalBid:0, sellOn:Infinity, mainImage:"", images:[]});
    }
    return (
        <div>
            <form onSubmit={onSubmit}>
                <label>
                    Назва
                    
                    <Input name='title' onInput={onInput} value={lot.title} />
                </label>
                <label>
                    Опис
                    
                    <textarea name='description' onInput={onInput} value={lot.description} />
                </label>
                <label>
                    Кынцева дата
                    
                    <Input name='endOn' onInput={onInput} value={lot.endOn} type="date"/>
                </label>
                <label>
                    Початкова ставка
                    
                    <Input name='minimalBid' onInput={onInput} value={lot.minimalBid} type="number"/>
                </label>
                <label>
                    гОЛОВНЕА КАРТИНКА, ВОНА блять ВЫДОБРАЖАЕТСЬЯ
                    
                    <Input name='mainImage' onInput={onInput} value={lot.mainImage} type="file"  accept="image/png, image/jpeg"/>
                </label>
                <label>
                    Енозер ымейджес
                    
                    <Input name='images' onInput={onInput} value={lot.images} type="file" multiple accept="image/png, image/jpeg"/>
                </label>
            </form>
        </div>
    )
}