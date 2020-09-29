import { h } from '@stencil/core';
import { JSXBase } from '@stencil/core/internal';

interface ImgProps extends JSXBase.ImgHTMLAttributes<HTMLImageElement>{
  path: string;

  name: string;

  type?: string;

  dimensions: string;

  fallback?: boolean;
}

const Img = ({ path, name, type = 'png', alt, dimensions, fallback = false, ...props }: ImgProps) => {
  !props.loading ? props.loading = 'lazy' : ''

  if (fallback) {
    return (
      <picture>
        <source
          src={`${path}${name}@2x.${type} 2x`}
        />
        <source
          src={`${path}${name}.${type} 1x`}
        />
        <img
          {...props}
          src={`${path}${name}.${type}`}
          width={dimensions.split('x')[0]}
          height={dimensions.split('x')[1]}
        />
      </picture>
    )
  } else {
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
  }
  
  
};

export default Img;