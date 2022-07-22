import { useEffect, useState } from "react";
import styles from "../styles/Home.module.css";
import { Collapse, List } from "antd";

const { Panel } = Collapse;

const baseUrl = "https://api.brandingbrand.com/create/v1";
const propertyId = 366;
const token = "enter auth token here"

const fetchApi = (url) =>
  fetch(url, {
    headers: {
      authorization: token,
    },
  }).then((data) => data.json());

const styleValueFilter = ([styleName, styleValue]) => styleValue === "";

export default function Home() {
  const [screenErrors, setScreenErrors] = useState([]);

  console.log({ screenErrors });

  async function getScreens() {
    const screens = await fetchApi(
      `${baseUrl}/properties/${propertyId}/published-screens`
    );

    const screenComponents = await Promise.all(
      screens.map(async (screen) => {
        const components = await fetchApi(
          `${baseUrl}/properties/${propertyId}/published-screens/${screen.id}/components`
        );

        const componentsWithStyleErrors = components
          .map((component) => {
            let errors = {};
            if (component.props.style) {
              errors = Object.fromEntries(
                Object.entries(component.props.style).filter(styleValueFilter)
              );
            }

            return {
              id: component.id,
              name: component.name,
              type: component.type,
              errors,
            };
          })
          .filter((component) => Object.keys(component.errors).length > 0);

        return {
          id: screen.id,
          name: screen.published_screen_history_snapshot.name,
          path: screen.published_screen_history_snapshot.path,
          components: componentsWithStyleErrors,
        };
      })
    ).then((screens) =>
      screens.filter(({ components }) => components.length > 0)
    );

    setScreenErrors(screenComponents);
  }

  useEffect(() => {
    getScreens();
  }, []);

  return (
    <div className={styles.container}>
      <Collapse>
        {screenErrors.map(({ id, name, path, components }) => (
          <Panel
            header={
              <div className="row">
                <div>{id}</div>
                <div>{name}</div>
                <div>{path}</div>
              </div>
            }
            key={id}
          >
            {components.map(({ id, name, type, errors }) => (
              <Collapse key={id}>
                <Panel header={name}>
                  <List>
                    {Object.entries(errors).map(([key, value]) => (
                      <List.Item key={key}>{`${key}: ${
                        value === "" ? "" : value
                      }`}</List.Item>
                    ))}
                  </List>
                </Panel>
              </Collapse>
            ))}
          </Panel>
        ))}
      </Collapse>
    </div>
  );
}
