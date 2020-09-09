import { h } from '@stencil/core';
import { JSXBase } from '@stencil/core/internal';

interface ImgProps extends JSXBase.ImgHTMLAttributes<HTMLImageElement>{
  path: string;

  name: string;

  type?: string;

  dimensions: string;

  // fallback?: () => HTMLImageElement;

  [key:string]: any;
}

const Img = ({ path, name, type = 'png', alt, dimensions, fallback, ...props }: ImgProps) => {
  !props.loading ? props.loading = 'lazy' : ''

  
  return (
    <img  
      {...props}
      src={`${path}${name}@2x.${type}`}
      srcset={`${path}${name}.${type} 1x,
              ${path}${name}@2x.${type} 2x`}
      width={dimensions.split('x')[0]}
      height={dimensions.split('x')[1]}
    />
  )
};

export default Img;