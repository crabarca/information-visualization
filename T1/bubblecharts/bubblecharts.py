
#!/usr/bin/python
import svgwrite
import json
import os
import math 

rootDir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
input_file = ''
outfile1 = os.path.join(rootDir, 'images/bubblechart1.svg')
outfile2 = os.path.join(rootDir, 'images/bubblechart2.svg')
canvas_height = '800px'
canvas_width = '1300px'

def parse_data(filename):
    with open(filename, 'r') as infile:
        data = json.load(infile)    
    return data 

def draw_circle(canvas, x, y, radio, color):
    canvas.add(canvas.circle(center=(x,y), r=radio, fill=color))

def draw_axis_x(canvas,data):
    # eje correspondiente a hdi
    xAxis = [(120, 700), (1000, 700)]
    xStartLabel = 180
    yStartLabel = 720
    xLabelOffset = 60

    hdi = sort_by_value(data, 'hdi')

    hdi = [item[1] for item in hdi]

    canvas.add(canvas.line(start=xAxis[0], end=xAxis[1] ,stroke="black", stroke_width = 2))

    scale = round((max(hdi) - min(hdi) ) / 9, 2)

    # guardo posicion de los labels para poder localizar los circulos  
    label_position = [(scale ,xStartLabel), xAxis[0]]
    for i in range(1, 15):
        canvas.add(canvas.text(text=round(scale * i, 2) , insert=(xStartLabel, yStartLabel)))
        xStartLabel += xLabelOffset

    canvas.add(canvas.text(text = 'Hdi', insert = (1020, 705)))
    
    return label_position

def draw_axis_y(canvas, data):
    # eje correspondiente a gini
    yAxis = [(120, 700), (120, 190)]
    
    xStartLabel = 70
    yStartLabel = 650

    yLabelOffset = 50

    gini = sort_by_value(data, 'gini')
    gini = [i[1] for i in gini]
    
    canvas.add(canvas.line(start = yAxis[0], end = yAxis[1], stroke= 'black', stroke_width = 2))

    scale = round((max(gini) - min(gini)) / 8, 2)
    print(scale)
    
    # guardo posicion de los labels y la posicion inicial para poder localizar los circulos  
    label_position = [(scale,yStartLabel), yAxis[0]]
    for i in range(1, 11):
        canvas.add(canvas.text(text=round(scale * i, 2), insert = (xStartLabel, yStartLabel)))
        yStartLabel -= yLabelOffset

    canvas.add(canvas.text(text = 'Gini', insert = (100, 180)))
    
    return label_position

def draw_bubblechart(canvas, data, xLabels, yLabels, tipo):
    sortedArea = list(reversed(sort_by_value(data, 'area')))
    for pais in sortedArea:
        color = get_color(data, tipo, data[pais[0]][tipo])
        x, y = get_coordinates(xLabels, yLabels, data[pais[0]]['hdi'], data[pais[0]]['gini'])
        radio = math.sqrt(data[pais[0]]['area'] / math.pi) / 25 # este es el factor de reduccion
        drw.add(drw.circle(center=(x,y), r=radio, fill=color, stroke_width=1, stroke='black'))

def draw_title(canvas, text, x, y):
    canvas.add(canvas.text(text=text , insert=(x, y), style="font-size:30"))

def draw_simbology(canvas, data, tipo):
    # agregamos cuadrados 
    xRectStart = 1100
    yRectStart = 300
    yRectOffset = 40

    xLabelStart = 1150
    continentes = ['Americas', 'Asia', 'Oceania', 'Europe', 'Africa']
    religiones = ['Islam', 'Christianity', 'Shinto', 'Syncretic', 'Buddhism', 'Animist', 'Judaism', 'Hindu']
    if tipo == 'continente':
        for i in range(5):
            color = get_color(data, tipo, continentes[i])
            canvas.add(canvas.rect(insert=(xRectStart,yRectStart), size=(50, 30), fill = color))
            canvas.add(canvas.text(text=continentes[i] , insert=(xLabelStart, yRectStart + 20), style="font-size:15"))
            yRectStart += yRectOffset

    elif tipo == 'religion':
        for i in range(8):
            color = get_color(data, tipo, religiones[i])
            canvas.add(canvas.rect(insert= (xRectStart, yRectStart), size=(50,30), fill = color))
            canvas.add(canvas.text(text=religiones[i], insert = (xLabelStart, yRectStart + 20), style="font-size:15"))
            yRectStart += yRectOffset


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
    if tipo == 'continente':
        colors = {'Americas': 'rgb(222,106,89)', 'Africa': 'rgb(77,77,77)' , 
                  'Asia':'rgb(222,177,89)' , 'Oceania':'rgb(43,135,134)' , 
                  'Europe': 'rgb(222,140,89)'}
        return colors[valor]
    elif tipo == 'religion':
        colors = {'Syncretic': 'rgb(222,140,89)', 'Islam': 'rgb(222,106,89)', 
                  'Christianity': 'rgb(222,177,89)',
                  'Judaism': 'rgb(222,89,139)', 'Hindu':'rgb(43,135,88)' ,  
                  'Shinto': 'rgb(43,135,134)',
                  'Buddhism': 'rgb(77,77,77)', 'Animist': 'rgb(201,222,89)',
                 'Non. Religious':'rgb(151, 191, 4)'}

        return colors[valor]
       

def sort_by_value(data, value):
    countries_value = {}
    for pais, info in data.items():
        countries_value[pais] = info[value]

    sorted_value = sorted(countries_value.items(), key=lambda x : x[1])
    return sorted_value


if __name__ == "__main__":
    data = parse_data(os.path.join(rootDir, 'processed_data/bubblecharts.json'))
    
    # BUBBLECHART CONTINENTAL 
    drw = svgwrite.Drawing(outfile1, size=(canvas_width, canvas_height))
    # print(data)
    
    xLabels = draw_axis_x(drw, data)
    yLabels = draw_axis_y(drw, data)

    draw_bubblechart(drw, data, xLabels, yLabels, 'continente')
    draw_title(drw, 'Color según continente', 400, 100)
    draw_simbology(drw, data, 'continente')

    drw.save()

    religion = sort_by_value(data, 'religion')
    relig = [item[1] for item in religion]
    count = [[x,relig.count(x)] for x in set(relig)]
    
#  BUBBLECHART RELIGIOSO
    drw = svgwrite.Drawing(outfile2, size=(canvas_width, canvas_height))
    # print(data)
    
    xLabels = draw_axis_x(drw, data)
    yLabels = draw_axis_y(drw, data)

    draw_bubblechart(drw, data, xLabels, yLabels, 'religion')
    draw_title(drw, 'Color según religión', 400, 100)
    draw_simbology(drw, data, 'religion')

    drw.save()
    
    