import { useRecoilState } from 'recoil';
import { countState } from '../states/countAtom';


function RecoilEx (){
    let [count, setCount] = useRecoilState(countState);
    return (
        <div>
            <h3>{count.countA}</h3>
            <button onClick={()=>{
                let temp = {...count}
                temp.countA++;

                setCount(temp);
            }}>countA</button>

        
            <h3>{count.countB}</h3>
            <button onClick={()=>{
                let temp = {...count}
                temp.countB++;

                setCount(temp);
            }}>countB</button>

        </div>
    )
}

export default RecoilEx