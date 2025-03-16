import React from "react";
import { Colors } from "@/constants/Colors";
import BackArrow from "./BackArrow";
import Mail from "./Mail";
import Show from "./Show";
import LockIcon from "./Lock";

const icons: { [key: string]: React.ComponentType<any> } = {
  backArrow: BackArrow,
  mail: Mail,
  show: Show,
  lock: LockIcon,
};

const Icon = ({
  name,
  ...props
}: {
  name: keyof typeof icons;
  [key: string]: any;
}) => {
  const IconComponent = icons[name];

  if (!IconComponent) {
    console.error(`Icon "${name}" not found!`);
    return null;
  }

  return (
    <IconComponent
      size={props.size || 24}
      color={props.color || Colors.light.text}
      strokeWidth={props.strokeWidth || 1.9}
      {...props}
    />
  );
};

export default Icon;
