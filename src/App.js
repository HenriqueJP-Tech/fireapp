import { useState, useEffect } from 'react'
import { db, auth } from './firebaseConnection'
import { 
  doc, 
  setDoc, 
  collection, 
  addDoc, 
  getDoc, 
  getDocs, 
  updateDoc, 
  deleteDoc,
  onSnapshot
} from 'firebase/firestore'

import './app.css';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged } from 'firebase/auth'

function App() {
  const [titulo, setTitulo] = useState('');
  const [autor, setAutor] = useState('');
  const [idPost, setIdPost] = useState('')

  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')

  const [user, setUser] = useState(false);
  const [userDetail, setUserDetail] = useState({})

  const [posts, setPosts] = useState([]);

  useEffect(() => {
    async function loadPosts(){
      const unsub = onSnapshot(collection(db, "posts"), (snapshot) => {
        let listaPost = [];

        snapshot.forEach((doc) => {
          listaPost.push({
            id: doc.id,
            titulo: doc.data().titulo,
            autor: doc.data().autor,
          })
        })
  
        setPosts(listaPost);
      })
    }

    loadPosts();

  }, [])

  useEffect(() => {
    async function checkLogin(){
      onAuthStateChanged(auth, (user) => {
        if(user){
          console.log(user)
          setUser(true);
          setUserDetail({
            uid: user.uid,
            email: user.email
          })
        } else{
          setUser(false);
          setUserDetail({})
        }
      })
    }
  }, [])

  async function handleAdd(){
    await addDoc(collection(db, "posts"), {
      titulo: titulo,
      autor: autor,
    })
    .then(() => {
      console.log("CADASTRADO COM SUCESSO")
      setAutor('');
      setTitulo('')
    })
    .catch((error) => {
      console.log("ERRO " + error)
    })
  }

  async function buscarPost(){

    const postsRef = collection(db, "posts")
    await getDocs(postsRef)
    .then((snapshot) => {
      let lista = [];

      snapshot.forEach((doc) => {
        lista.push({
          id: doc.id,
          titulo: doc.data().titulo,
          autor: doc.data().autor,
        })
      })

      setPosts(lista);

    })
    .catch((error) => {
      console.log("DEU ALGUM ERRO AO BUSCAR")
    })
  }

  async function editarPost(){
    const docRef = doc(db, "posts", idPost)
    await updateDoc(docRef, {
      titulo: titulo,
      autor: autor
    })
    .then(() => {
      console.log("POST ATUALIZADO!")
      setIdPost('')
      setTitulo('')
      setAutor('')
    })
    .catch((error) => {
      console.log(error)
    })
  }

  async function excluirPost(id){
    const docRef = doc(db, "posts", id)
    await deleteDoc(docRef)
    .then(() =>{
      alert("POST DELETADO!")
    })

  }

  async function novoUsuario(){
    await createUserWithEmailAndPassword(auth, email, senha)
    .then(() => {
      console.log("USUÁRIO CADASTRADO COM SUCESSO!")
      setEmail('');
      setSenha('')
    })
    .catch((error) => {
      console.log("USUÁRIO NÃO CADASTRADO")
    })
  }

  async function logarUsuario(){
    await signInWithEmailAndPassword(auth, email, senha)
    .then((value) => {
      console.log("USUÁRIO LOGADO")
      console.log(value.user)

      setUserDetail({
        uid: value.user.uid,
        email: value.user.email,
      })
      setUser(true);
      setEmail('')
      setSenha('')
    })
    .catch((error) => {
      console.log("ERRO AO ENTRAR")
    })
  }

  async function fazerLogout(){
    await signOut(auth)
    setUser(false);
    setUserDetail({})
  }


  return (
    <div>
      <h1>ReactJS + Firebase :)</h1>
    {user && (
      <div>
        <strong>Seja bem-vindo(a) - Você está logado!</strong><br/>
        <span>ID: {userDetail.uid} - Email: {userDetail.email}</span>
        <br/>
        <button onClick={fazerLogout}>Sair da Conta</button>
        <br/>
        <br/>
     </div>
    )}
    <div className='container'>
      <h2>Acesso do Usuário</h2>
        <label>E-mail:</label>
        <input value={email} onChange={(e) => setEmail(e.target.value)}
        placeholder='Digite seu melhor e-mail'/>
        <br/>

        <label>Senha:</label>
        <input value={senha} onChange={(e) => setSenha(e.target.value)}
        placeholder='Informe sua senha'/>
        <br/>

        <button onClick={novoUsuario}>Cadastrar</button><br/>
        <button onClick={logarUsuario}>Fazer Login</button>
    </div>
    <br/>
    <br/>
    <hr/>

    <div className="container">
      <h2>Posts</h2>
        <label>ID do Post:</label>
        <input
          placeholder='Digite o ID do post'
          value={idPost}
          onChange={ (e) => setIdPost(e.target.value) }
        /> <br/>

        <label>Titulo:</label>
        <textarea 
          type="text"
          placeholder='Digite o titulo'
          value={titulo}
          onChange={ (e) => setTitulo(e.target.value) }
        />

        <label>Autor:</label>
        <input 
          type="text" 
          placeholder="Autor do post"
          value={autor}
          onChange={(e) => setAutor(e.target.value) }
        />

        <button onClick={handleAdd}>Cadastrar</button>
        <button onClick={buscarPost}>Buscar post</button> <br/>
        <button onClick={editarPost}>Atualizar post</button>

        <ul>
          {posts.map( (post) => {
            return(
              <li key={post.id}>
                <strong>ID: {post.id}</strong> <br/>
                <span>Titulo: {post.titulo} </span> <br/>
                <span>Autor: {post.autor}</span> <br/> 
                <button onClick={ () => excluirPost(post.id) }>Excluir</button> <br/> <br/>
              </li>
            )
          })}
        </ul>

    </div>

    </div>
  );
}

export default App;
