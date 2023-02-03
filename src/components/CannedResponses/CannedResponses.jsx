import React from 'react';
import { connect } from 'react-redux';
import { Actions, withTheme, Manager} from '@twilio/flex-ui';
import FormControl from '@material-ui/core/FormControl';
import InputLabel from '@material-ui/core/InputLabel';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';

import { CannedResponsesStyles } from './CannedResponses.Styles';

class CannedResponses extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      response: '',
    }
  }

  manager = Manager.getInstance();

  handleChange = (event) => {
    this.setState({ [event.target.name]: event.target.value });

    Actions.invokeAction('SetInputText', {
      channelSid: this.props.channelSid,
      body: event.target.value
    });
  }

  render() {
    return (

      /* Rendering canned responses. This is an example in which templates are hard-coded. They can be dynamic using Twilio Sync */
      <CannedResponsesStyles>
        <FormControl className="form">
          <InputLabel className="input-label" htmlFor="response"> Quick Responses </InputLabel>
          <Select
            value={this.state.response}
            onChange={this.handleChange}
            name="response"
          >
            <MenuItem value="¡Hola! Te saludamos de Webhelp. Hemos recibido tu hoja de vida y queremos contactarte para que participes en nuestro proceso de selección. Puedes confirmar en respuesta a este mensaje el horario y número de teléfono al cual podemos contactarte. Gracias por tu interés en formar parte de #TheIncredyblePlaceToWork"> Primer Contacto</MenuItem>
            <MenuItem value="¡Hola! Te saludamos del área de atracción de talento de Webhelp, gracias por tu interés en formar parte de nuestra familia e iniciar el proceso de selección con nosotros."> Bienvenida (saludo) </MenuItem>
            <MenuItem value="¡Hola!, Nos estamos comunicando contigo nuevamente para validar si has tenido dificultades para realizar las pruebas o apoyarte en las dudas que tengas. Te agradecemos puedas confirmarnos por este mismo medio"> Recordatorio de pruebas </MenuItem>
            <MenuItem value='Buen día "nombre", te saludamos de Webhelp. Hemos intentado contactarte para iniciar el proceso de selección para la plaza de “nombre de la plaza " sin obtener respuesta de tu parte. Por favor bríndanos una hora en la que le podamos contactarte para iniciar tu proceso de selección respondiendo en este chat.

             Esperamos que puedas participar y ser parte de nuestra familia
             '>Sin contacto en llamada</MenuItem>
          </Select>
        </FormControl>
      </CannedResponsesStyles>
    )
  }
};

const mapStateToProps = (state, ownProps) => {
  let currentTask = false;
  state.flex.worker.tasks.forEach((task) => {
    if (ownProps.channelSid === task.attributes.channelSid) {
      currentTask = task;
    }
  })

  return {
    state,
    currentTask,
  }
}

export default connect(mapStateToProps)(withTheme(CannedResponses));