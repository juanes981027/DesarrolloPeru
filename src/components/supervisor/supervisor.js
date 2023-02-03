import './Supervisor.css';
import { withTaskContext } from "@twilio/flex-ui";

const completar = () => {
    alert("Tarea completada");
  }

class Supervisor extends React.Component {
    constructor(props) {
        super(props);
        
        this.state = {favoritecolor: "red"};
        this.taskName = this.props.task.attributes.name;   
    }
   

    render() {
        return ( 
            <div className="container"> 
          
            
            
                <button onClick={completar}>completar</button>
              
            </div>
        );
    
    }
}

export default withTaskContext(Supervisor);