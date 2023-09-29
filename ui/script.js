let useState = React.useState;
let useEffect = React.useEffect;
// access the pre-bundled global API functions
const { invoke } = window.__TAURI__.tauri;



function PlayListBar(props){
    let playSong = ()=>{
        props.toggleSong(props.name)
    }

    let editToggle = ()=>{
        props.editToggle(props.name);
    }

    let deleteForever = ()=>{
        props.deleteForever(props.name)
    }

    return <div className="playlist">
        <div>
            {props.name}
        </div>
        <div>
            <span className="material-symbols-outlined" onClick={()=>playSong()}>play_circle</span>
            <span className="material-symbols-outlined" onClick={()=>editToggle()}>edit</span>
            <span className="material-symbols-outlined" onClick={()=>deleteForever()}>delete_forever</span>
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
    let [editDialogOpen, setEditDialogOpen] = useState(false)

    let [currentAddRemove, setCurrentAddRemove] = useState([[],[],""])

    let playPlayList = (name)=>{
        for(let i =0; i<songs.length;i++){
            if(songs[i][0]===name){
                invoke("play_music", {name:songs[i][1]})
            }
        }
    }
    let toggleEditModal = (name)=>{
        let t = [];
        for(let i = 0;i<songs.length;i++){
            if(songs[i][0]==name){
                setCurrentAddRemove([[],songs[i][1]]);
                t = songs[i][1];
            }
        }

        invoke("get_song_lists").then((res)=>{
            for(let i = 0; i<res.length;i++){
                if(!t.includes(res[i])){
                    setCurrentAddRemove(e=>{
                        return [[...e[0],res[i]],e[1]]
                    })
                }
            }

            setCurrentAddRemove(old=>{
                return [old[0],old[1],name]
            })
        })

        setEditDialogOpen(true);
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

    let rerender_song_lists = ()=>{
        invoke('get_json_file').then((d)=>{
            let pl = JSON.parse(d).playlists;
            for(let i = 0;i<pl.length;i++){
                pl[i][1] = pl[i][1].sort(() => Math.random() - 0.5);
            }
            setSongs(pl);
        })
    }
    let deleteSong = (name, playlist)=>{
        let newSongs = songs;
        for(let i =0; i<songs.length;i++){
            if(songs[i][0]==playlist){
                newSongs[i][1] = songs[i][1].filter((e)=>{
                    return e!=name;
                })
                setSongs(newSongs)
            }
        }


        updateJSON(newSongs);
    }
    let addSong = (name, playlist)=>{
        let newSongs = songs;
        for(let i =0; i<songs.length;i++){
            if(songs[i][0]==playlist){
                newSongs[i][1] = [...songs[i][1],name];
                setSongs(newSongs)
            }
        }


        updateJSON(newSongs);
    }
    let updateJSON = (l)=>{
        let newJSON = {
            playlists: l
        }
        invoke('update_json_file', {data:JSON.stringify(newJSON)}).then((d)=>{
            rerender_song_lists();
            if(editDialogOpen==true){
                toggleEditModal(currentAddRemove[2]);
            }else{
                toggleEditModal(currentAddRemove[2]);
                setEditDialogOpen(false);
            }
        })
    }

    let deletePlayList = (name)=>{
        let newSongs = [];
        for(let i =0; i<songs.length;i++){
            if(songs[i][0]==name){

            }else{
                newSongs.push(songs[i]);
            }
        }

        updateJSON(newSongs);
    }
    let createPlayList = ()=>{
        let name = prompt("Enter Playlist Name");
        if(name!=null){
            let newSongs = songs;
            newSongs.push([name,[]]);
            updateJSON(newSongs);
        }
    }
    return <>
        <div id="main-page">
            <div id="playlists-subsection">
                <div id="playlist-glassmorphism">
                    <span style={{display:"flex",justifyContent: "space-between",alignItems: "center",gap:"25px"}}>
                        <h2>Playlists</h2>
                        <button className="new-button" onClick={createPlayList}>
                            <span className="material-symbols-outlined">add</span>
                            New
                        </button>
                    </span>
                    <div id="playlist-container">
                        {
                            songs.map((e,i)=>{
                                return <PlayListBar key={i} deleteForever={deletePlayList} editToggle={toggleEditModal} toggleSong={playPlayList} name={e[0]}/>
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

        {/*Dialog*/}
        <dialog id="song-edit-bar" open={editDialogOpen}>
            <div id={"dialog-inside-container"}>
                <span>
                    Rename Playlist: <input/>
                </span>
                <span>
                    Add Songs
                    <div id="song-add-list">
                        {
                            currentAddRemove[0].map((e,i)=>{
                                return <div key={i} style={{border:"1px black solid"}}>
                                    <span >{e}</span>
                                    <span onClick={()=>addSong(e,currentAddRemove[2])} className={"material-symbols-outlined"}>add</span>
                                </div>
                            })
                        }
                    </div>
                </span>
                <span>
                    Remove Songs
                    <div id="song-remove-list">
                        {
                            currentAddRemove[1].map((e,i)=>{
                                return <div key={i} style={{border:"1px black solid"}}>
                                    <span>{e}</span>
                                    <span onClick={()=>deleteSong(e,currentAddRemove[2])}  className={"material-symbols-outlined"}>delete</span>
                                </div>
                            })
                        }
                    </div>
                </span>
                <span>
                    <button onClick={()=>setEditDialogOpen(false)}>Close</button>
                </span>
            </div>
        </dialog>

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