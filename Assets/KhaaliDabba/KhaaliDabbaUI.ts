import {FlexLayout} from 'SpectaclesUIKit.lspkg/Scripts/Components/Layout2D/Flex/FlexLayout';
import {FlexItem} from 'SpectaclesUIKit.lspkg/Scripts/Components/Layout2D/Flex/FlexItem';
import {FlexAlign,FlexDirection,FlexJustify,FlexAlignSelf} from 'SpectaclesUIKit.lspkg/Scripts/Components/Layout2D/Flex/FlexTypes';
import {obj} from './KhaaliGeometry';

// One restrained spatial subtitle group. The neighborhood is the interface.
const FONT_SIZE_SCALE=1.7;
const TYPE_SCALE={Headline:{size:48,weight:700},Body:{size:39,weight:500},Caption:{size:38,weight:500}};
function applyTextRole(t:Text,role:keyof typeof TYPE_SCALE) {t.size=TYPE_SCALE[role].size;(t as Text & {weight?:number}).weight=TYPE_SCALE[role].weight;}
export function welcomeNote(parent:SceneObject,font?:Font):SceneObject {
  const note=obj(parent,'Sharma Aunty handwritten welcome',new vec3(0,1.15,-5));
  const lettering=obj(note,'Handwritten Hindi',new vec3(0,0,0.13));
  const t=lettering.createComponent('Component.Text') as Text;t.text='नए आए हो ना?\nघर का बना है।\n— Sharma Aunty';
  applyTextRole(t,'Body');lettering.getTransform().setLocalScale(new vec3(0.75,0.75,0.75));
  t.textFill.color=new vec4(0.3,0.09,0.035,1);
  note.getTransform().setLocalRotation(quat.angleAxis(-Math.PI/2,vec3.right()));
  t.layoutRect=Rect.create(-7,7,-3.4,3.4);t.horizontalAlignment=HorizontalAlignment.Center;t.verticalAlignment=VerticalAlignment.Center;t.depthTest=true;if(font)t.font=font;return note;
}
export class KhaaliDabbaUI {
  private title:Text;private body:Text;private hint:Text;
  constructor(root:SceneObject,font?:Font) {
    root.createComponent('Component.Canvas');
    const content=obj(root,'Story subtitles',new vec3(0,0,0.6));
    const flex=content.createComponent(FlexLayout.getTypeName()) as FlexLayout;
    // Runtime construction happens before this component's OnStart. Register
    // children explicitly; UIKit 2 rejects addItems with auto-discovery enabled.
    flex.autoDiscoverItemsOnStart=false;
    flex.onInitialized.add(()=>{flex.width=43;flex.height=15;flex.direction=FlexDirection.Column;flex.alignItems=FlexAlign.Stretch;flex.justifyContent=FlexJustify.Center;flex.rowGap=0.6;});
    const make=(name:string,h:number,role:keyof typeof TYPE_SCALE)=>{
      const row=obj(content,name,new vec3(0,0,0.02));const item=row.createComponent(FlexItem.getTypeName()) as FlexItem;
      item.overrideWidth=43;item.overrideHeight=h;item.flexShrink=0;item.alignSelf=FlexAlignSelf.Stretch;
      const text=row.createComponent('Component.Text') as Text;applyTextRole(text,role);text.layoutRect=Rect.create(-21.5,21.5,-h/2,h/2);
      text.size*=FONT_SIZE_SCALE;
      text.textFill.color=role==='Headline'?new vec4(1,0.78,0.25,1):new vec4(1,0.96,0.82,1);
      text.outlineSettings.enabled=true;text.outlineSettings.size=0.2;text.outlineSettings.fill.color=new vec4(0.08,0.035,0.025,1);
      text.horizontalAlignment=HorizontalAlignment.Center;text.verticalAlignment=VerticalAlignment.Center;text.depthTest=true;if(font)text.font=font;
      text.horizontalOverflow=HorizontalOverflow.Wrap;
      flex.addItems([item]);return text;
    };
    this.title=make('Chapter',3,'Headline');this.body=make('Neighbour story',7,'Body');this.hint=make('Next gesture',3,'Caption');
  }
  set(title:string,body:string,hint:string) {this.title.text=title;this.body.text=body;this.hint.text=hint;}
}
