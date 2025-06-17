import { useParams } from "react-router-dom";
import ChatComponent from "./ChatComponent";
import Header from "../Header";

const ChatPage = () => {
  const { id } = useParams();

  return (
    <div>
      <Header />
      <ChatComponent selectedUserId={parseInt(id)} />
    </div>
  );
};

export default ChatPage;
