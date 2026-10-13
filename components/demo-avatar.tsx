'use client';
import {useEffect,useState} from 'react';
import {Avatar} from './avatar';
import {DEMO_PHOTO_KEY,validAvatar} from '@/lib/avatar';
export function DemoAvatar({name}:{name:string}){const [photo,setPhoto]=useState<string|null>(null);useEffect(()=>{function update(){try{const p=localStorage.getItem(DEMO_PHOTO_KEY);setPhoto(validAvatar(p)?p:null)}catch{}}update();window.addEventListener('cavity-demo-change',update);window.addEventListener('storage',update);return()=>{window.removeEventListener('cavity-demo-change',update);window.removeEventListener('storage',update)}},[]);return <Avatar name={name} photo={photo}/>}
