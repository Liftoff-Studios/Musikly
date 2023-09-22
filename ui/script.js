let useState = React.useState;
let useEffect = React.useEffect;
// access the pre-bundled global API functions
const { invoke } = window.__TAURI__.tauri;





function PlayListBar(props){
    let playSong = ()=>{
        props.toggleSong(props.name)
    }

    return <div className="playlist">
        <div>
            {props.name}
        </div>
        <div>
            <span className="material-symbols-outlined" onClick={()=>playSong()}>play_circle</span>
            <span className="material-symbols-outlined" onClick="openEditDialog('${playlists[i][0]}')">edit</span>
            <span className="material-symbols-outlined">delete_forever</span>
        </div>
    </div>
}

function LoadScene(){
    return <>
        <div id="startup">
            <img className="startup-logo" src="logo.svg"/>
            <img className="startup-logo" style={{animationName:"down"}} src="logo.svg"/>
            <img className="startup-logo" src="logo.svg"/>
            <img className="startup-logo" style={{animationName:"down"}} src="logo.svg"/>
        </div>
    </>
}

function MainScene(){
    let [songs,setSongs] = useState([]);//Songs List

    let playPlayList = (name)=>{
        for(let i =0; i<songs.length;i++){
            if(songs[i][0]==name){
                invoke("play_music", {name:songs[i][1]})
            }
        }
    }

    useEffect(()=>{
        invoke('get_json_file').then((d)=>{
            let pl = JSON.parse(d).playlists;
            for(let i = 0;i<pl.length;i++){
                pl[i][1] = pl[i][1].sort(() => Math.random() - 0.5);
            }

            setSongs(pl);
        })
    },[]);
    return <>
        <div id="main-page">
            <div id="playlists-subsection">
                <div id="playlist-glassmorphism">
                    <span style={{display:"flex",justifyContent: "space-between",alignItems: "center",gap:"25px"}}>
                        <h2>Playlists</h2>
                        <button className="new-button">
                            <span className="material-symbols-outlined">add</span>
                            New
                        </button>
                    </span>
                    <div id="playlist-container">
                        {
                            songs.map((e,i)=>{
                                return <PlayListBar toggleSong={playPlayList} name={e[0]}/>
                            })
                        }
                    </div>
                </div>
            </div>
            <div id="logo-subsection" style={{position:"sticky"}}>
                <img src="logo.svg"/>
                <span>Musikly is a small app made by Liftoff-Studios so that he could enjoy listening to music without wasting internet :))</span>
            </div>
        </div>
    </>
}

function App(){
    let [scene, setScene] = useState("load");
    useEffect(()=>{
        setTimeout(()=>{
            setScene("home")
        },3000)
    },[])

    if(scene=="load"){
        return <LoadScene/>
    }else{
        return <MainScene/>
    }

}

const root = ReactDOM.createRoot(document.getElementById('app'));
root.render(<App/>);