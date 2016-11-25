import React from 'react';
import hoistStatics from 'hoist-non-react-statics';

export default function withinClientContext(wrapperProps, initClientContext) {
  if (typeof wrapperProps === 'function') {
    initClientContext = wrapperProps;
    wrapperProps = null;
  }
  let clientContext;
  return function compose(ComposedComponent) {
    class WithinClientContext extends React.Component {
      constructor(props) {
        super(props);
        this.state = {
          isClientContext: false,
        };
      }

      componentDidMount() { // May called only on client-side
        if (!this.state.isClientContext) {
          if (initClientContext) {
            clientContext = initClientContext();
            initClientContext = null;
          }
        }
        this.setState({
          isClientContext: true,
        });
      }

      render() {
        let props = {
          ...clientContext,
          ...this.props,
        };
        return (
          // Wrap in <div> to have possibility preserve space for ComposedComponent
          // and also to avoid error:
          // Warning: React attempted to reuse markup in a container but the checksum was invalid
          // (See https://github.com/facebook/react/issues/4374)
          <div {...wrapperProps}>
            { this.state.isClientContext && <ComposedComponent {...props} /> }
          </div>
        );
      }
    }

    const displayName = ComposedComponent.displayName || ComposedComponent.name || 'Component';

    WithinClientContext.displayName = `WithinClientContext(${displayName})`;
    WithinClientContext.ComposedComponent = ComposedComponent;

    return hoistStatics(WithinClientContext, ComposedComponent);
  }
}
