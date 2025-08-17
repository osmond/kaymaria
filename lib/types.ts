export type CareType='water'|'fertilize'|'repot'; export type TaskDTO={id:string;plantId:string;plantName:string;type:CareType;dueAt:string;status:'due';lastEventAt?:string};
