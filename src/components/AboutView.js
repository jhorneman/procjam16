import React from 'react';
import ReactMarkdown from 'react-markdown';


const aboutViewContent = `
The White City is a game by [Liz England](http://www.lizengland.com), [Jurie Horneman](http://www.intelligent-artifice.com), and [Stefan Srb](http://www.leaf-thief.com/),
developed for [Procjam 2016](http://www.procjam.com).

The texts, assets, and source code can be found on [GitHub](https://github.com/jhorneman/procjam16).

The content of this game is licensed under the Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International (CC BY-NC-SA 4.0) license. The source code is licensed under the MIT License. See [here](https://github.com/jhorneman/procjam16/blob/master/LICENSE) for more details.
`;


function AboutView() {
    return (<div className='aboutView'>
        <ReactMarkdown source={aboutViewContent} />
    </div>);
}


export default AboutView;
