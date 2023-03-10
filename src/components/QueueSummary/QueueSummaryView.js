import React from "react";
import { connect } from 'react-redux';

import { withTheme } from "@twilio/flex-ui";
import { namespace } from '../../states';

import QueueSummaryTable from "./QueueSummaryTable";
import { QueueSummaryTableContainer } from './QueueSummaryView.Components';
import { QueueSummaryService } from '../../states/QueueSummaryService';
import { QueueSummaryListener } from '../../states/QueueSummaryListener';
import { CONFIG, DEFAULT_POLL_FREQUENCY_IN_MILLIS } from "../../utils/Constants";


class QueueSummaryView extends React.Component {

  queueSummaryListener = undefined;
  refreshTimer = undefined;

  constructor(props) {
    super(props);
    if (CONFIG.useLiveQuery) {
      this.queueSummaryListener = QueueSummaryListener.create();
    }
  }




  componentDidMount() {
    //Only need timer if not using LiveQuery/QueueSummaryListener
    if (!CONFIG.useLiveQuery) {
      QueueSummaryService.init();
      this.refreshTimer = window.setInterval(() => {
        QueueSummaryService.refresh();
      }, 
      CONFIG.pollFrequencyInMillis ? CONFIG.pollFrequencyInMillis : DEFAULT_POLL_FREQUENCY_IN_MILLIS);
    } else {
      this.queueSummaryListener.queuesSearch();
    }
  }

  componentDidUpdate() {}

  componentWillUnmount() {
    if (!CONFIG.useLiveQuery) {
      if (this.refreshTimer !== undefined) {
        window.clearInterval(this.refreshTimer);
      }
      QueueSummaryService.close();
    } else {
      this.queueSummaryListener.unsubscribe();
    }
  }

  render() {
    return (
      <QueueSummaryTableContainer>
        <QueueSummaryTable queues={this.props.queueSummary.queues} config={this.props.queueSummary.config} />
      </QueueSummaryTableContainer>
    );
  }
}

const mapStateToProps = (state) => {
  const customReduxStore = state?.[namespace];

  return {
    queueSummary: customReduxStore.queueSummary
  }
}



export default connect(mapStateToProps)(withTheme(QueueSummaryView));