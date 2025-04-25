declare module 'antd' {
  export const ConfigProvider: any;
}

declare module 'antd/locale/zh_CN' {
  const zhCN: any;
  export default zhCN;
}

declare module '*.scss' {
  const content: { [className: string]: string };
  export default content;
}

declare module '*.css' {
  const content: { [className: string]: string };
  export default content;
}

// Add support for webpack hot module replacement
declare interface NodeModule {
  hot?: {
    accept(path?: string, callback?: () => void): void;
  };
} 