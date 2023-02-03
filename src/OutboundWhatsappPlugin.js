import React from 'react';
import { VERSION, SideLink, Actions } from '@twilio/flex-ui';
import { FlexPlugin } from 'flex-plugin';
import NewWaTaskButton from './components/NewWaTaskButton/NewWaTaskButton';
import OutboundWaDialog from './components/OutboundWaDialog/OutboundWaDialog';
import CannedResponses from './components/CannedResponses/CannedResponses';

import BubbleMessageWrapper from './components/attachments/BubbleMessageWrapper/BubbleMessageWrapper'
import ImageModal from './components/attachments/ImageModal/ImageModal';
import LoadingComponent from './components/attachments/LoadingComponent/LoadingComponent';
// import Supervisor from './components/supervisor/supervisor';
import PasteMediaComponent from './components/attachments/PasteMediaComponent/PasteMediaComponent';
import SendMediaComponent from './components/attachments/SendMediaComponent/SendMediaComponent';
import SendMediaService from './services/SendMediaService';
import { setUpActions, setUpComponents, setUpNotifications } from './helpers';

// import CustomTaskListContainer from './components/History/HistoryConversation';
import reducers, { namespace } from './states';
// import { ContextUtil } from "./utils/ContextUtil";
import QueueSummaryView from "./components/QueueSummary";
import AssignTaskDialog from "./components/AssignTaskDialog/AssignTaskDialog";
import HistoryConversation from './components/History/HistoryConversation';

const PLUGIN_NAME = 'OutboundWhatsappPlugin';

const ALLOWED_CHANNELS = [ 'chat-sms', 'chat-whatsapp' ];

export default class OutboundWhatsappPlugin extends FlexPlugin {
  constructor() {
    super(PLUGIN_NAME);
  }

  /**
   * This code is run when your plugin is being started
   * Use this to modify any UI components or attach to the actions framework
   *
   * @param flex { typeof import('@twilio/flex-ui') }
   * @param manager { import('@twilio/flex-ui').Manager }
   */
  async init(flex, manager) {

    this.registerReducers(manager);
    setUpComponents();
    setUpNotifications();
    setUpActions();

    const userRoles = manager.workerClient.attributes.roles;
    const isUserAdmin = userRoles.includes('admin');
    const isUserSupervisor = userRoles.includes('supervisor');
    const isAgent = userRoles.includes('agent');

    flex.Actions.registerAction("smsModalControl", (payload) => {
      var event = new Event("smsModalControlOpen");
      event.url = payload.url;
      document.dispatchEvent(event);
      return Promise.resolve();
    });
    // Unbind this action of the native attachments feature (this is under pilot yet).
    flex.Actions.replaceAction('AttachFile', (payload) => { return; });
    
    flex.MessageBubble.Content.add(<BubbleMessageWrapper key="image" />);
    flex.MainContainer.Content.add(<ImageModal key="imageModall" />, {
      sortOrder: 1
    });
    
    const loadingRef = React.createRef();
    const sendMediaService = new SendMediaService(manager);

    flex.MessagingCanvas.Content.add(
      <LoadingComponent 
        key="mediaLoading"
        ref={loadingRef}
      />
    );

    flex.MessagingCanvas.Content.add(
      <PasteMediaComponent
        key="pasteMedia"
        allowedChannels={ALLOWED_CHANNELS}
        sendMediaService={sendMediaService}
        loading={loadingRef}
      />
    );

    flex.MessageInput.Content.add(
      <SendMediaComponent 
        key="sendMedia" 
        allowedChannels={ALLOWED_CHANNELS} 
        sendMediaService={sendMediaService} 
        loading={loadingRef}
      />
    );

     // ignore "media not supported" errors
     manager.strings.MediaMessageError = '';
  
//   
      if(isUserAdmin||isUserSupervisor) {
        flex.ViewCollection.Content.add(
          <flex.View name="QueueSummaryView" key="queueSummaryView">
            <QueueSummaryView />
          </flex.View>
        );

        flex.SideNav.Content.add(
          <SideLink
            key="tasksSideLink"
            icon="GenericTask"
            iconActive="GenericTaskBold"
            onClick={() =>
              Actions.invokeAction("NavigateToView", { viewName: "QueueSummaryView" })
            }
          >
            Pending Tasks
          </SideLink>,
          {sortOrder: 2 }
        );

        flex.SideNav.Content.add(<AssignTaskDialog
          key="assign-task-modal"
        />, { sortOrder: 100 });
      }
//


flex.TaskCanvasTabs.Content.add(
  <flex.Tab label="History" key="previous-chat-messages">
    <HistoryConversation key={"history-conversation-component"} />
  </flex.Tab>, {sortOrder:3}
);


    // flex.Supervisor.TaskCanvasTabs.Content.add(
    //   <flex.Tab label="Supervisor" key="supervisor-messages">
    //     <Supervisor key={"supervisor-component"} />
    //   </flex.Tab>, {sortOrder:3}
    // );

    //Add Notification Portal Widget
    flex.CRMContainer.defaultProps.uriCallback = (task) => {
      return task
        ? `https://zeus.onelinkbpo.com/Zeus-OnelinkReclutamientoAdmin/reclutamiento-admin`
        : 'https://zeus.onelinkbpo.com/Zeus-OnelinkReclutamientoAdmin/reclutamiento-admin';
    }

    const options = { sortOrder: -1 };
    //flex.AgentDesktopView.Panel1.Content.add(<CustomTaskListContainer key="DigitalHiringPlugin-component" />, options);

    /*Outbound WhatsApp button*/
    flex.MainHeader.Content.add(<NewWaTaskButton key="outbound-whatsapp-button" />, { sortOrder: -999, align: 'end' })

    /*Custom action to dispatch an event and open the modal screen*/
    flex.Actions.registerAction("waModalControl", (payload) => {
      var event = new Event("waModalControlOpen");
      document.dispatchEvent(event);
      return Promise.resolve();
    });

    /*Outbound Whatsapp Dialog */
    flex.MainContainer.Content.add(<OutboundWaDialog key="imageModal" />, {
      sortOrder: 1
    });

    /*Notification registration for task creation*/
    /* flex.Notifications.registerNotification({
      id: "waTaskCreated",
      closeButton: true,
      content: "Outbound Whatsapp task created. The customer has not yet been messaged.  contacPleaset him using one of the pre-registered templates.",
      timeout: 5000,
      type: "information"
    }); */

    /* Agent auto-responses */
    flex.MessageInput.Content.add(<CannedResponses key="canned-responses" />);

    /* Register event listener for new reservations so Flex will auto-accept outbound tasks */
    /*
    manager.workerClient.on ('reservationCreated', payload => {
      const { sid, task } = payload;
      console.log(task.attributes);

      if (task.attributes.channelType === 'whatsapp' && task.attributes.direction === 'outbound') {
        console.log('New outbound task received');
        flex.Notifications.showNotification("waTaskCreated", null);
        flex.Actions.invokeAction('AcceptTask', {
          sid
        });
        flex.Actions.invokeAction('SelectTask', {
          sid
        });
      } */
      

      //Enable Task Auto Accept using  method.
      
    manager.workerClient.on("reservationCreated", reservation => {

      const { sid, task } = reservation;
      //console.log("Task del metodo asincrono: " + task.attributes.direction)
      if (task.attributes.channelType === 'whatsapp' && task.attributes.direction === 'outbound') {
         flex.Actions.invokeAction("AcceptTask", { sid: reservation.sid });
        flex.Actions.invokeAction("SelectTask", { sid: reservation.sid });
      }

      if (task) {
        function open_page() {
          var configuracion_ventana = "menubar=no,location=yes,resizable=yes,scrollbars=yes,status=yes,width=650,height=550,top=650,left=930";
          var objeto_window_referencia;
          //Validates if is a outbound call
          if (task.queueName == "voice_outbound_to") {
            var number = task.attributes.outbound_to
          } else {
            var number = task.attributes.name;
          }
          //Clear number outbound voice
          if (task.queueName == "voice_outbound_to") {
            number = number.replace("+503", "");
          } 
          //Clear number inbound message
          
          if(task.attributes.direction === 'inbound') {
            number = number.replace("whatsapp:", "");
          } else {
            number = number.replace("whatsapp:+503", "");
          }
          //Clear number outbound message
          if(task.attributes.direction === 'outbound') {
            number = number.replace("whatsapp:", "");
          } else {
            number = number.replace("whatsapp:+503", "");
          }
          
          objeto_window_referencia = window.open(`https://onelinkbpo.hire.trakstar.com/app/#candidates/list/type:search/search:${number}`, "Pagina", configuracion_ventana);
        }
        flex.Actions.addListener("afterAcceptTask", (reservation) => open_page());
      }
    });
  }

  /**
   * Registers the plugin reducers
   *
   * @param manager { Flex.Manager }
   */
  registerReducers(manager) {
    if (!manager.store.addReducer) {
      // eslint-disable-next-line
      console.error(`You need FlexUI > 1.9.0 to use built-in redux; you are currently on ${VERSION}`);
      return;
    }
    manager.store.addReducer(namespace, reducers);
  }
}
