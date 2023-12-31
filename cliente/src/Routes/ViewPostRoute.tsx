import { useParams, useNavigate , Link } from "react-router-dom";
import { useEffect , useState } from "react";
import { api } from "../api";
import { Card } from "../components/Card";
import { Button } from "../components/Button";
import toast from "react-simple-toasts";
import { LinkButton } from "../components/LinkButton";
import { Breadcrumbs } from "../components/Breadcumbs";
import { Title } from "../components/Title";
import { useGlobalStore } from "../useGlobalStore";



const initialPost = {
id: 0,
content:"",
created_at:"",
user_id: 0,

};

const initialComments =[];
const initialComment ="";

const texts = {
    commentsTitle: "Comentários",
    commentsSendButton: "Enviar"
};


export function ViewPostRoute() {
    const isAuthorized = useGlobalStore ((state) => state.isAuthorized);
    const user = useGlobalStore((state)=> state.user);
    const params = useParams();
    const [post, setPost] = useState(initialPost);
    const navigate = useNavigate();
    const [comments, setComments] = useState(initialComments);
    const [comment, setComment] = useState(initialComment);


    async function loadPost() {
        const response = await api.get(`/posts/${params.id}`);
        const nextPost = response.data;
        setPost(nextPost);
    }

    async function deletePost() {
        const response = await api.delete(`/posts/${params.id}`);  
        if(response.data.id) {
            toast(`A publicação #${post.id} foi deletada com sucesso!`);
            navigate("/");
        } else {
            toast(`Houve um erro ao deletar a publicação!`);
        }
    }

    async function loadComments(){
        const response = await api.get(`/posts/${params.id}/comments`);
        const comments = response.data;
        setComments(comments);
       }  


    async function createComment(){
         await api.post(`/posts/${params.id}/comments`, {
            message: comment,
            post_id: params.id,
        });
    }

    async function onCommentSubmit(event) {
         event.preventDefault();
         await createComment();
         await loadComments();
    }
     

    useEffect(() => {
        loadPost();
        loadComments();
    },[params.id]);

console.log(comments);

    return (
        <div>
        <Card className="my-17 md:max-w-screen-md md:mx-auto flex relative flex-col">
            <Breadcrumbs links={[
                {href: '/', label:'Home'},
                {href:`/ver-publicação/${params.id}`, label:`Ver publicação #${params.id}`}

            ]}/>
            <span className="text-gray-500 mb-1">#{post.id}</span>
            <div className="text-gray-500 font-bold mb-1"> {new Date(post.created_at).toLocaleDateString()}</div>
            <p className="pb-12">{post.content}</p>
            
            {isAuthorized && user.id ===post.user_id &&
            <div className="flex gap-1">
            <Button className="bg-pink-500 hover:bg-pink-600 w-20 flex absolute -bottom-0 right-6" onClick= {deletePost}>Deletar</Button>
            <LinkButton to ={`/editar-publicação/${params.id}`} className="bg-orange-500 hover:bg-orange-600 w-20 flex absolute -bottom-0 right-28">Editar</LinkButton>
            </div>}
        </Card>

        
        <Card className="my-17 md:max-w-screen-md md:mx-auto flex relative flex-col">
            <Title > {texts.commentsTitle}</Title>
            {isAuthorized && (
            <form onSubmit={onCommentSubmit} className="mt-2">                 
                <textarea 
                        placeholder="Digite a sua publicação"
                        rows = {3}
                        className={'m-1 rounded-md px-2 py-1 border focus:border-green-500 outline-none resize-none w-full '} 
                        value = {comment}
                        onChange = {(event) =>setComment(event.target.value)}
                />
            
            <div className="flex justify-end">
            <Button className="w-20 mt-2" type="submit">{texts.commentsSendButton}</Button>
            </div>
            </form>
            )}
            {!isAuthorized && (
          <div className="my-4">
            <p>
              Para comentar, você deve{" "}
              <Link
                to="/entrar"
                className="text-blue-600 hover:text-blue-800 hover:underline font-bold"
              >
                entrar
              </Link>{" "}
              ou{" "}
              <Link
                to="/criar-conta"
                className="text-blue-600 hover:text-blue-800 hover:underline font-bold"
              >
                criar uma conta
              </Link>
              .
            </p>
          </div>
        )}
            <div>
        {comments.map((comment) => (
        <div key={comment.id} className={'flex relative flex-col my-4 border-b'}> 
        <div   className="flex items-center gap-1 ">
        <Link to={`/perfil/${comment.user_id}`}>
            <img src={comment.users.avatar}alt={`Foto de ${comment.users.first_name} ${comment.users.last_name}`} className="w-[48px] h-[48px] rounded-full" />
          </Link>
          <div className="flex flex-col"> 
            <Link to={`/perfil/${comment.user_id}`} className="text-blue-600 hover:text-blue-800 hover:underline font-bold">
              {comment.users.first_name} {comment.users.last_name}
            </Link>
            <span className="text-sm text-gray-500"> {new Date(comment.created_at).toLocaleDateString()} </span>
          </div>
        </div>
          <p>{comment.message}</p>
    </div>
     ))}
    </div>
        </Card>
        </div>
    );}