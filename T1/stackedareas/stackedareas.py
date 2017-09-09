
#!/usr/bin/python
import svgwrite
import json
import os
import math 

rootDir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
input_file = ''

canvas_height = '800px'
canvas_width = '1300px'

def parse_data(filename):
    with open(filename, 'r') as infile:
        data = json.load(infile)    
    return data 

def draw_axis_x(canvas,data):
    # eje correspondiente a hdi
    xAxis = [(120, 700), (1000, 700)]
    xStartLabel = 180
    yStartLabel = 720
    xLabelOffset = 60

    years = sorted([int(year) for year in data.keys()])
    

    canvas.add(canvas.line(start=xAxis[0], end=xAxis[1] ,stroke="black", stroke_width = 2))

    scale = round((max(years) - min(years) ) / 9, 2)

    # guardo posicion de los labels para poder localizar los circulos  
    label_position = [(scale ,xStartLabel), xAxis[0]]
    for i in range(14):
         canvas.add(canvas.text(text=years[i] , insert=(xStartLabel, yStartLabel)))
         xStartLabel += xLabelOffset

    canvas.add(canvas.text(text = 'Años', insert = (1020, 705)))
    
    return label_position

def draw_axis_y(canvas, data):
        # eje correspondiente a gini
    yAxis = [(120, 700), (120, 190)]
    
    xStartLabel = 70
    yStartLabel = 650

    yLabelOffset = 50

    # gini = sort_by_value(data, 'gini')
    # gini = [i[1] for i in gini]
    
    canvas.add(canvas.line(start = yAxis[0], end = yAxis[1], stroke= 'black', stroke_width = 2))

    # scale = round((max(gini) - min(gini)) / 8, 2)
    
    # guardo posicion de los labels y la posicion inicial para poder localizar los circulos  
    # label_position = [(scale,yStartLabel), yAxis[0]]
    # for i in range(1, 11):
    #     canvas.add(canvas.text(text=round(scale * i, 2), insert = (xStartLabel, yStartLabel)))
    #     yStartLabel -= yLabelOffset

    canvas.add(canvas.text(text = 'Gini', insert = (100, 180)))
    
    return label_position


def draw_title(canvas, text, x, y):
    canvas.add(canvas.text(text=text , insert=(x, y), style="font-size:30"))

def draw_simbology(canvas, data, tipo):
    pass

# FUNCIONES AUXILIARES PARA OBTENER CARACTERISTICAS A DIBUJAR
def get_coordinates(xLabels, yLabels, x, y):
    # retorna la posicion en pixeles donde va a estar x,y (hdi, gini) en funcion de los labels del canvas
    # se calcula la posicion definiendo dos ecuaciones de la recta  
    pendienteX = (xLabels[0][1] - xLabels[1][0]) / xLabels[0][0]
    pendienteY = (yLabels[0][1] - yLabels[1][1]) / yLabels[0][0]

    xPixel = pendienteX * x + xLabels[1][0]
    yPixel = pendienteY * y + yLabels[1][1]

    return xPixel, yPixel

def get_color(data, tipo, valor):
    pass
       

def make_stacked_area(data, continente):
    # stackear una religion encima de otra de manera de poder saber el alto total del stack 
    # voy a tener solamente 4 areas 
    # retorno lista 2d en donde cada fila es una religion y cada columna un punto a posicionar en el grafico
    stacked_points = []
    religions = ['nonrelig', 'hindgen', 'islmgen', 'chrstgen']
    years = sorted(list(map(lambda x: x, data.keys())))
    stack = 0
    aux = []
    while  len(religions) != 0:
        for year in years:
            xCoord = 0
            yCoord = 0
            for i in religions:
                yCoord += data[year][continente][i]
                xCoord = int(year)
            aux.append((xCoord, yCoord))
            if year == '2010': 
                stacked_points.append(aux)
                aux = []
                del religions[0]
    print(stacked_points)
    return stacked_points

def draw_stacked_graph(canvas, data, continente):
    graphHeight = 600
    pop_scale = 2500000
    xStart = 150
    yStart = 600
    xOffset = 50
    stacked_coords = make_stacked_area(canvas, data, continente)
    colors = ['red', 'green', 'blue', 'black']
    color = 0
    for religion in stacked_coords:
        lines = canvas.add(canvas.g(id='line', fill = colors[color]))
        line = lines.add(canvas.polyline())
        line.points.append((xStart, graphHeight))
        for point in religion:
            print(year_scale(point[0]), population_scale(point[1]))
            line.points.append((year_scale(point[0]), 
                                graphHeight - population_scale(point[1]))) 
        line.points.append((year_scale(2017), graphHeight))
        print(colors[color])
        color += 1

def year_scale(year):
    y = 10 * year - 19300
    return y

def population_scale(pop):
    y = (600 - 200)/((10**8) - (10**9)) * pop + 5800/9
    return y


if __name__ == "__main__":
    data = parse_data(os.path.join(rootDir, 'processed_data/stackedgraphs.json'))
    outfile1 = os.path.join(rootDir, 'stackedareas/stacked1.svg')
    
    # STACKED CONTINENTAL 
    drw = svgwrite.Drawing(outfile1, size=(canvas_width, canvas_height))
    # print(data)
    draw_axis_x(drw, data)
    draw_axis_y(drw, data)
    
    # draw_stacked_graph(data, 'america')


#  BUBBLECHART RELIGIOSO

    drw.save()
    
    