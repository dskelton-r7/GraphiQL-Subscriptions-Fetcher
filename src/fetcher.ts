import { SubscriptionClient } from 'subscriptions-transport-ws';
import { parse } from 'graphql';

const hasSubscriptionOperation = (graphQlParams: any) => {
  const queryDoc = parse(graphQlParams.query);

  for (let definition of queryDoc.definitions) {
    if (definition.kind === 'OperationDefinition') {
      const operation = definition.operation;
      if (operation === 'subscription') {
        return true;
      }
    }
  }

  return false;
};

export const graphQLFetcher = (subscriptionsClient: SubscriptionClient, fallbackFetcher: Function) => {
  let activeSubscriptionId: number | null = null;

  return (graphQLParams: any) => {
    if (subscriptionsClient && activeSubscriptionId !== null) {
      (<any>subscriptionsClient).unsubscribe(activeSubscriptionId);
    }

    if (subscriptionsClient && hasSubscriptionOperation(graphQLParams)) {
      return {
        subscribe: (observer: { error: Function, next: Function }) => {
          observer.next('Your subscription data will appear here after server publication!');
          activeSubscriptionId = (<any>subscriptionsClient.request(graphQLParams)).subscribe(observer.next, observer.error);
        },
      };
    } else {
      return fallbackFetcher(graphQLParams);
    }
  };
};
