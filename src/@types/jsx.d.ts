/// <reference types="react" />

// Объявление JSX глобального пространства имен
declare global {
  namespace JSX {
    interface Element extends React.ReactElement<any, any> {}
    
    interface ElementAttributesProperty { 
      props: {}; 
    }
    
    interface ElementChildrenAttribute { 
      children: {}; 
    }
    
    interface IntrinsicAttributes extends React.Attributes {}
    
    interface IntrinsicClassAttributes<T> extends React.ClassAttributes<T> {}
  }
}

export {}; 